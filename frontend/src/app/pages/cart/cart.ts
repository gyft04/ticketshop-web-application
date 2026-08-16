import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  constructor(
    public cartService: CartService,
    public router: Router
  ) {}

  removeItem(id: number) {
    this.cartService.removeItem(id);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
