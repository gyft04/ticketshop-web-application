import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { OrdersService } from '../../services/orders';
@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  name = signal('');
  paymentMethod = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);

  readonly paymentOptions = ['Credit Card', 'PayPal', 'Invoice'];

  constructor(
    public cartService: CartService,
    private ordersService: OrdersService,
    public router: Router
  ) {}

  ngOnInit(): void {
    if (this.cartService.totalCount() === 0) {
      this.router.navigate(['/cart']);
    }
  }

  placeOrder() {
    if (!this.name() || !this.paymentMethod()) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const orderItems = this.cartService.cartItems().map(i => ({
      ticket_category_id: i.ticket_category_id,
      quantity: i.quantity
    }));

    this.ordersService.createOrder(orderItems).subscribe({
      next: (res: any) => {
        this.cartService.clearCart();
        this.router.navigate(['/order-confirmation', res.orderId]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.error || 'Order failed. Please try again.');
      }
    });
  }
}
