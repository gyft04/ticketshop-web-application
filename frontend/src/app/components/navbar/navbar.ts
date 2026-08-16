import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  constructor(
    public cartService: CartService,
    public authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.cartService.clearCart();
    this.router.navigate(['/events']);
  }
}
