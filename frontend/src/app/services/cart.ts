import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface CartItem {
  dbId?: number;
  ticket_category_id: number;
  eventTitle: string;
  ticketName: string;
  price: number;
  quantity: number;
}

const API_BASE = 'http://localhost:3000/api';

function getOrCreateSessionId(): string {
  let id = localStorage.getItem('cart_session');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('cart_session', id);
  }
  return id;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private sessionId = getOrCreateSessionId();

  private items = signal<CartItem[]>([]);

  readonly cartItems = this.items.asReadonly();

  readonly totalCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  loadCart(): void {
    this.http
      .get<any[]>(`${API_BASE}/cart/${this.sessionId}`)
      .subscribe({
        next: (rows) => {
          const mapped: CartItem[] = rows.map(row => ({
            dbId: row.id,
            ticket_category_id: row.ticket_category_id,
            eventTitle: row.event_title,
            ticketName: row.ticket_name,
            price: Number(row.price),
            quantity: row.quantity,
          }));
          this.items.set(mapped);
        },
        error: () => {
          // If backend is unreachable, keep signal empty — no crash
        },
      });
  }

  addItem(item: CartItem): void {
    // Update signal immediately for snappy UI
    const existing = this.items().find(i => i.ticket_category_id === item.ticket_category_id);
    if (existing) {
      this.items.update(items =>
        items.map(i =>
          i.ticket_category_id === item.ticket_category_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      );
    } else {
      this.items.update(items => [...items, item]);
    }

    // Persist to DB in background
    this.http
      .post<{ id: number }>(`${API_BASE}/cart`, {
        session_id: this.sessionId,
        ticket_category_id: item.ticket_category_id,
        quantity: item.quantity,
      })
      .subscribe({
        next: (res) => {
          // Store the DB row id in the signal item so we can delete by id later
          this.items.update(items =>
            items.map(i =>
              i.ticket_category_id === item.ticket_category_id
                ? { ...i, dbId: res.id }
                : i
            )
          );
        },
        error: () => {
          // HTTP failed — signal already updated, cart works but won't persist
        },
      });
  }

  removeItem(ticket_category_id: number): void {
    const target = this.items().find(i => i.ticket_category_id === ticket_category_id);

    // Update signal immediately
    this.items.update(items => items.filter(i => i.ticket_category_id !== ticket_category_id));

    // Delete from DB in background if we have the DB id
    if (target?.dbId != null) {
      this.http
        .delete(`${API_BASE}/cart/item/${target.dbId}`)
        .subscribe({ error: () => {} });
    }
  }

  clearCart(): void {
    // Clear signal immediately
    this.items.set([]);

    // Clear DB in background
    this.http
      .delete(`${API_BASE}/cart/session/${this.sessionId}`)
      .subscribe({ error: () => {} });
  }
}
