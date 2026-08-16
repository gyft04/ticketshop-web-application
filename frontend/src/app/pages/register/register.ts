import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  name = signal('');
  email = signal('');
  password = signal('');
  role = signal<'user' | 'organizer'>('user');
  slug = signal('');
  errorMessage = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const slugVal = this.role() === 'organizer' ? this.slug() : undefined;
    this.authService.register(this.name(), this.email(), this.password(), this.role(), slugVal).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err: any) => {
        const msg = err?.error?.error || 'Registration failed. Email may already exist.';
        this.errorMessage.set(msg);
      }
    });
  }
}
