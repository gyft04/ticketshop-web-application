import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop implements OnInit {
  organizerName = signal('');
  slug = signal('');
  allEvents = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  searchQuery = signal('');

  filteredEvents = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return !q ? this.allEvents() : this.allEvents().filter(e => e.title.toLowerCase().includes(q));
  });

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.slug.set(slug);
    this.http.get<any>(`http://localhost:3000/api/shop/${slug}`).subscribe({
      next: (data) => {
        this.organizerName.set(data.organizerName);
        this.allEvents.set(data.events);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.status === 404 ? 'Shop not found.' : 'Could not load shop.');
        this.loading.set(false);
      }
    });
  }
}
