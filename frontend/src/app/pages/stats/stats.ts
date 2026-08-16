import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../services/orders';

@Component({
  selector: 'app-stats',
  imports: [CommonModule],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class Stats implements OnInit {
  stats = signal<any>(null);
  loading = signal(true);
  error = signal('');

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.ordersService.getStats().subscribe({
      next: (data: any) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load statistics. Admin access required.');
        this.loading.set(false);
      }
    });
  }
}
