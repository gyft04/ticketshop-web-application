import { Component, Input, AfterViewInit, OnDestroy, OnChanges, ElementRef, ViewChild } from '@angular/core';
import * as L from 'leaflet';

// Fix default marker icon paths broken by webpack
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

@Component({
  selector: 'app-map-leaflet',
  standalone: true,
  template: `<div #mapContainer class="leaflet-map-container"></div>`,
  styles: [`
    .leaflet-map-container {
      width: 100%;
      height: 260px;
      border-radius: 16px;
      overflow: hidden;
      margin-top: 20px;
      border: 1px solid rgba(255,255,255,0.3);
    }
  `]
})
export class MapLeaflet implements AfterViewInit, OnDestroy, OnChanges {
  @Input() lat!: number;
  @Input() lng!: number;
  @Input() zoom = 15;
  @Input() locationName = '';

  @ViewChild('mapContainer') mapContainer!: ElementRef;
  private map: L.Map | null = null;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(): void {
    if (this.map && this.lat && this.lng) {
      this.map.setView([this.lat, this.lng], this.zoom);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private initMap(): void {
    if (!this.lat || !this.lng || !this.mapContainer) return;

    this.map = L.map(this.mapContainer.nativeElement, { zoomControl: true }).setView([this.lat, this.lng], this.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    L.marker([this.lat, this.lng], { icon: iconDefault })
      .addTo(this.map)
      .bindPopup(this.locationName || 'Event Location')
      .openPopup();
  }
}
