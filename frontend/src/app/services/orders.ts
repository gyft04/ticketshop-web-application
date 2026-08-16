import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getOrders() {
    return this.http.get(`${this.apiUrl}/orders`, { headers: this.getAuthHeaders() });
  }

  createOrder(items: { ticket_category_id: number; quantity: number }[]) {
    return this.http.post(`${this.apiUrl}/orders`, { items }, { headers: this.getAuthHeaders() });
  }

  getStats() {
    return this.http.get(`${this.apiUrl}/stats`, { headers: this.getAuthHeaders() });
  }

  getOrderById(id: number) {
    return this.http.get(`${this.apiUrl}/orders/${id}`, { headers: this.getAuthHeaders() });
  }
}
