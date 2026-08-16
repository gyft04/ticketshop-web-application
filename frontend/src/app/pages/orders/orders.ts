import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrdersService } from '../../services/orders';

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  orders = signal<any[]>([]);
  loading = signal(true);

  constructor(private ordersService: OrdersService, public router: Router) {}

  ngOnInit(): void {
    this.ordersService.getOrders().subscribe({
      next: (data: any) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/login']);
      }
    });
  }
}
