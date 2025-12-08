import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

interface Vehicle {
  id: number;
  title: string;
  brand: string;
  price: number;
  year: number;
  mileage: number;
  city: string;
  location: string;
  lat: number;
  lng: number;
  image: string;
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.scss',
})
export class MapaComponent implements OnInit {
  map!: L.Map;
  selectedBrand: string = '';
  minPrice: number = 0;
  maxPrice: number = 100000;
  minYear: number = 2010;
  searchRadius: number = 50; // km
  filteredVehicles: Vehicle[] = [];
  allVehicles: Vehicle[] = [
    {
      id: 1,
      title: 'Toyota Corolla 2022',
      brand: 'Toyota',
      price: 25000,
      year: 2022,
      mileage: 15000,
      city: 'Quito',
      location: 'Centro-Norte',
      lat: -0.2193,
      lng: -78.5125,
      image: 'https://via.placeholder.com/200x150?text=Toyota',
    },
    {
      id: 2,
      title: 'Chevrolet Onix 2023',
      brand: 'Chevrolet',
      price: 22000,
      year: 2023,
      mileage: 8000,
      city: 'Guayaquil',
      location: 'Costa',
      lat: -2.1692,
      lng: -79.9218,
      image: 'https://via.placeholder.com/200x150?text=Chevrolet',
    },
    {
      id: 3,
      title: 'Hyundai i10 2021',
      brand: 'Hyundai',
      price: 18000,
      year: 2021,
      mileage: 25000,
      city: 'Cuenca',
      location: 'Sur',
      lat: -2.9036,
      lng: -79.0087,
      image: 'https://via.placeholder.com/200x150?text=Hyundai',
    },
    {
      id: 4,
      title: 'Kia Picanto 2023',
      brand: 'Kia',
      price: 20000,
      year: 2023,
      mileage: 5000,
      city: 'Quito',
      location: 'Sur',
      lat: -0.3522,
      lng: -78.5249,
      image: 'https://via.placeholder.com/200x150?text=Kia',
    },
    {
      id: 5,
      title: 'Renault Kwid 2022',
      brand: 'Renault',
      price: 19000,
      year: 2022,
      mileage: 12000,
      city: 'Ambato',
      location: 'Sierra',
      lat: -1.2343,
      lng: -78.6344,
      image: 'https://via.placeholder.com/200x150?text=Renault',
    },
    {
      id: 6,
      title: 'Ford F-150 2023',
      brand: 'Ford',
      price: 35000,
      year: 2023,
      mileage: 3000,
      city: 'Guayaquil',
      location: 'Norte',
      lat: -2.0988,
      lng: -79.8581,
      image: 'https://via.placeholder.com/200x150?text=Ford',
    },
  ];

  markers: { [key: number]: L.Marker } = {};

  ngOnInit() {
    this.filteredVehicles = [...this.allVehicles];
    setTimeout(() => this.initMap(), 100);
  }

  initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.map = L.map('map').setView([-1.8312, -78.1834], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Add markers for all vehicles
    this.updateMapMarkers();
  }

  private updateMapMarkers() {
    // Remove all existing markers
    Object.values(this.markers).forEach((marker) => this.map.removeLayer(marker));
    this.markers = {};

    // Add markers for filtered vehicles
    this.filteredVehicles.forEach((vehicle) => {
      const marker = L.marker([vehicle.lat, vehicle.lng])
        .addTo(this.map)
        .bindPopup(this.createMarkerPopup(vehicle));

      this.markers[vehicle.id] = marker;
    });
  }

  private createMarkerPopup(vehicle: Vehicle): string {
    return `
      <div style="width: 200px; text-align: center;">
        <img src="${
          vehicle.image
        }" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
        <b style="color: #2d2d96;">${vehicle.title}</b><br>
        <span style="color: #666;">$${vehicle.price.toLocaleString()}</span><br>
        <small style="color: #888;">${vehicle.mileage.toLocaleString()} km | ${vehicle.city}</small>
      </div>
    `;
  }

  applyFilters() {
    this.filteredVehicles = this.allVehicles.filter((vehicle) => {
      const matchesBrand = this.selectedBrand === '' || vehicle.brand === this.selectedBrand;
      const matchesPrice = vehicle.price >= this.minPrice && vehicle.price <= this.maxPrice;
      const matchesYear = vehicle.year >= this.minYear;
      return matchesBrand && matchesPrice && matchesYear;
    });

    this.updateMapMarkers();
  }

  centerOnVehicle(vehicle: Vehicle) {
    this.map.setView([vehicle.lat, vehicle.lng], 13);
    this.markers[vehicle.id]?.openPopup();
  }

  contactVehicle(vehicle: Vehicle) {
    // In a real app, this would open a contact form or modal
    alert(
      `¡Contactar sobre: ${vehicle.title}\nTeléfono: +593 (2) 3814-000\nEmail: info@desarrollo.gob.ec`
    );
  }

  getBrands(): string[] {
    return Array.from(new Set(this.allVehicles.map((v) => v.brand))).sort();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(price);
  }
}
