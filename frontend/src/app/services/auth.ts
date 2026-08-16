import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  private _loggedIn = signal<boolean>(!!localStorage.getItem('token'));
  readonly loggedIn = this._loggedIn.asReadonly();

  readonly role = computed(() => {
    if (!this._loggedIn()) return '';
    return this.decodeRole();
  });

  readonly slug = computed(() => {
    if (!this._loggedIn()) return '';
    return this.decodeSlug();
  });

  readonly isOrganizer = computed(() => this.role() === 'organizer' || this.role() === 'admin');
  readonly isBuyer = computed(() => this.role() === 'user' || this.role() === 'admin');

  constructor(private http: HttpClient) {}

  private decodeRole(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || '';
    } catch {
      return '';
    }
  }

  private decodeSlug(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.slug || '';
    } catch {
      return '';
    }
  }

  register(name: string, email: string, password: string, role: 'user' | 'organizer' = 'user', slug?: string) {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password, role, slug });
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this._loggedIn.set(true);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string {
    return this.decodeRole();
  }

  logout() {
    localStorage.removeItem('token');
    this._loggedIn.set(false);
  }

  isLoggedIn(): boolean {
    return this._loggedIn();
  }
}
