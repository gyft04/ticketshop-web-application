import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth';

const API = 'http://localhost:3000/api';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  events = signal<any[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');

  showForm = signal(false);
  editingId = signal<number | null>(null);
  uploadingImage = signal(false);
  imagePreview = signal('');

  form = signal({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    location: '',
    category: '',
    image: '',
    status: 'published' as string,
    standard_price: 15,
    standard_qty: 50,
    vip_price: 25,
    vip_qty: 20,
  });

  readonly shopUrl = computed(() => `/shop/${this.authService.slug()}`);

  constructor(private http: HttpClient, public authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading.set(true);
    this.http.get<any[]>(`${API}/organizer/events`, { headers: this.getHeaders() }).subscribe({
      next: (data) => { this.events.set(data); this.loading.set(false); },
      error: () => { this.errorMessage.set('Failed to load events.'); this.loading.set(false); }
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.set({ title: '', description: '', start_date: '', end_date: '', start_time: '', end_time: '', location: '', category: '', image: '', status: 'published', standard_price: 15, standard_qty: 50, vip_price: 25, vip_qty: 20 });
    this.imagePreview.set('');
    this.successMessage.set('');
    this.errorMessage.set('');
    this.showForm.set(true);
  }

  openEdit(event: any): void {
    this.editingId.set(event.id);
    this.form.set({
      title: event.title || '',
      description: event.description || '',
      start_date: event.start_date ? event.start_date.slice(0, 10) : '',
      end_date: event.end_date ? event.end_date.slice(0, 10) : '',
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      location: event.location || '',
      category: event.category || '',
      image: event.image || '',
      status: event.status || 'published',
      standard_price: 15,
      standard_qty: 50,
      vip_price: 25,
      vip_qty: 20,
    });
    this.imagePreview.set(event.image || '');
    this.successMessage.set('');
    this.errorMessage.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadingImage.set(true);
    const formData = new FormData();
    formData.append('image', file);
    this.http.post<{ url: string }>(`${API}/upload`, formData).subscribe({
      next: (res) => {
        this.form.update(f => ({ ...f, image: res.url }));
        this.imagePreview.set(res.url);
        this.uploadingImage.set(false);
      },
      error: () => { this.errorMessage.set('Image upload failed.'); this.uploadingImage.set(false); }
    });
  }

  updateFormField(field: string, value: string): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  updateFormFieldNumber(field: string, value: number): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  onSubmit(): void {
    const id = this.editingId();
    const body = this.form();
    const req = id
      ? this.http.put(`${API}/organizer/events/${id}`, body, { headers: this.getHeaders() })
      : this.http.post(`${API}/organizer/events`, body, { headers: this.getHeaders() });

    req.subscribe({
      next: () => {
        this.successMessage.set(id ? 'Event updated!' : 'Event created!');
        this.showForm.set(false);
        this.loadEvents();
      },
      error: (err) => this.errorMessage.set(err?.error?.error || 'Save failed.')
    });
  }

  deleteEvent(id: number): void {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    this.http.delete(`${API}/organizer/events/${id}`, { headers: this.getHeaders() }).subscribe({
      next: () => this.loadEvents(),
      error: () => this.errorMessage.set('Delete failed.')
    });
  }
}
