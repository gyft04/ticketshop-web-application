import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventsService } from '../../services/events';
import { CartService } from '../../services/cart';
import { MapLeaflet } from '../../components/map-leaflet/map-leaflet';

@Component({
  selector: 'app-event-detail',
  imports: [CommonModule, MapLeaflet],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetail implements OnInit {
  eventData = signal<any>(null);
  tickets = signal<any[]>([]);
  quantities: { [ticket_category_id: number]: number } = {};

  readonly mapLat = computed(() => {
    const loc = this.eventData()?.location;
    if (!loc) return null;
    // Try to get coordinates from a geo field if present
    return this.eventData()?.geo_lat ? Number(this.eventData().geo_lat) : null;
  });

  readonly mapLng = computed(() => {
    return this.eventData()?.geo_lng ? Number(this.eventData().geo_lng) : null;
  });

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private eventsService: EventsService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.eventsService.getEventById(id).subscribe({
      next: data => this.eventData.set(data),
      error: err => console.error('Event error:', err)
    });

    this.eventsService.getTicketsByEventId(id).subscribe({
      next: (data: any[]) => {
        this.tickets.set(data);
        data.forEach(t => this.quantities[t.id] = 0);
      },
      error: () => this.tickets.set([])
    });
  }

  increase(ticketId: number) {
    const ticket = this.tickets().find(t => t.id === ticketId);
    if (!ticket) return;

    if (this.quantities[ticketId] < ticket.quantity_available) {
      this.quantities[ticketId]++;
    }
  }

  maxErreicht(ticket: any): boolean {
    return this.quantities[ticket.id] >= ticket.quantity_available;
  }

  decrease(ticketId: number) {
    if (this.quantities[ticketId] > 0) {
      this.quantities[ticketId]--;
    }
  }

  addToCart() {
    this.tickets().forEach(ticket => {
      const qty = this.quantities[ticket.id];
      if (qty > 0) {
        this.cartService.addItem({
          ticket_category_id: ticket.id,
          eventTitle: this.eventData()?.title,
          ticketName: ticket.name,
          price: ticket.price,
          quantity: qty
        });
        this.quantities[ticket.id] = 0;
      }
    });
    this.router.navigate(['/cart']);
  }

  get totalSelected(): number {
    return Object.values(this.quantities).reduce((sum, q) => sum + q, 0);
  }
}
