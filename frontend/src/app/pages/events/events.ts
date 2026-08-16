import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventsService } from '../../services/events';

@Component({
  selector: 'app-events',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class EventsComponent implements OnInit {
  allEvents = signal<any[]>([]);
  searchQuery = signal('');
  selectedCategory = signal('');

  filteredEvents = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();
    return this.allEvents().filter(event => {
      const matchesSearch = !query || event.title.toLowerCase().includes(query);
      const matchesCategory = !category || event.category === category;
      return matchesSearch && matchesCategory;
    });
  });

  categories = computed(() => {
    const all = this.allEvents().map(e => e.category).filter(Boolean);
    return [...new Set(all)] as string[];
  });

  constructor(private eventsService: EventsService) {}

  ngOnInit(): void {
    this.eventsService.getEvents().subscribe({
      next: (data: any) => this.allEvents.set(data),
      error: err => console.error('Events error:', err)
    });
  }
}
