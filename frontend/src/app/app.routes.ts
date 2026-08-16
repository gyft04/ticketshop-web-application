import { Routes } from '@angular/router';

import { NotFound } from './pages/not-found/not-found';
import { EventsComponent } from './pages/events/events';
import { EventDetail } from './pages/event-detail/event-detail';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Cart } from './pages/cart/cart';
import { Admin } from './pages/admin/admin';
import { Orders } from './pages/orders/orders';
import { Checkout } from './pages/checkout/checkout';
import { OrderConfirmation } from './pages/order-confirmation/order-confirmation';
import { Shop } from './pages/shop/shop';
import { authGuard } from './guards/auth-guard';


export const routes: Routes = [
  { path: '', redirectTo: 'events', pathMatch: 'full' },
  { path: 'events', component: EventsComponent },
  { path: 'events/:id', component: EventDetail },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'cart', component: Cart, canActivate: [authGuard] },
  { path: 'checkout', component: Checkout, canActivate: [authGuard] },
  { path: 'order-confirmation/:id', component: OrderConfirmation, canActivate: [authGuard] },
  { path: 'orders', component: Orders, canActivate: [authGuard] },
  { path: 'admin', component: Admin, canActivate: [authGuard] },
  { path: 'shop/:slug', component: Shop },
  { path: '**', component: NotFound },
];

