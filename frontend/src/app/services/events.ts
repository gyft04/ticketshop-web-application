import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`);
  }

  getEventById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/${id}`);
  }

  getTicketsByEventId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/${id}/tickets`);
  }
}
