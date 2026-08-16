import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '../../services/orders';

@Component({
  selector: 'app-order-confirmation',
  imports: [CommonModule],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css',
})
export class OrderConfirmation implements OnInit {
  order = signal<any>(null);
  loading = signal(true);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.ordersService.getOrderById(id).subscribe({
      next: (data: any) => {
        this.order.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load order details.');
        this.loading.set(false);
      }
    });
  }
}
