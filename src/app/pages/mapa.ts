import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

interface Product {
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
  showFilters: boolean = false;
  selectedBrand: string = '';
  minPrice: number = 0;
  maxPrice: number = 100000;
  minYear: number = 2010;
  searchRadius: number = 50; // km
  filteredProducts: Product[] = [];
  allProducts: Product[] = [
    {
      id: 1,
      title: 'Camiseta Premium Azul',
      brand: 'Fashion Store',
      price: 25,
      year: 2024,
      mileage: 0,
      city: 'Quito',
      location: 'Centro-Norte',
      lat: -0.2193,
      lng: -78.5125,
      image: 'https://via.placeholder.com/200x150?text=Camiseta',
    },
    {
      id: 2,
      title: 'Zapatillas Deportivas',
      brand: 'SportGear',
      price: 85,
      year: 2024,
      mileage: 0,
      city: 'Guayaquil',
      location: 'Costa',
      lat: -2.1692,
      lng: -79.9218,
      image: 'https://via.placeholder.com/200x150?text=Zapatillas',
    },
    {
      id: 3,
      title: 'Medias Algodón Pack 6',
      brand: 'ComfortWear',
      price: 12,
      year: 2024,
      mileage: 0,
      city: 'Cuenca',
      location: 'Sur',
      lat: -2.9036,
      lng: -79.0087,
      image: 'https://via.placeholder.com/200x150?text=Medias',
    },
    {
      id: 4,
      title: 'Pantalón Jean Premium',
      brand: 'DenimCo',
      price: 65,
      year: 2024,
      mileage: 0,
      city: 'Quito',
      location: 'Sur',
      lat: -0.3522,
      lng: -78.5249,
      image: 'https://via.placeholder.com/200x150?text=Pantalon',
    },
    {
      id: 5,
      title: 'Chocolate Artesanal 100g',
      brand: 'Dulces Ecuador',
      price: 8,
      year: 2024,
      mileage: 0,
      city: 'Ambato',
      location: 'Sierra',
      lat: -1.2343,
      lng: -78.6344,
      image: 'https://via.placeholder.com/200x150?text=Chocolate',
    },
    {
      id: 6,
      title: 'Café Gourmet Molido',
      brand: 'CafePuro',
      price: 18,
      year: 2024,
      mileage: 0,
      city: 'Guayaquil',
      location: 'Norte',
      lat: -2.0988,
      lng: -79.8581,
      image: 'https://via.placeholder.com/200x150?text=Cafe',
    },
  ];

  markers: { [key: number]: L.Marker } = {};

  ngOnInit() {
    this.filteredProducts = [...this.allProducts];
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

    // Add markers for filtered products
    this.filteredProducts.forEach((product) => {
      const marker = L.marker([product.lat, product.lng])
        .addTo(this.map)
        .bindPopup(this.createMarkerPopup(product));

      this.markers[product.id] = marker;
    });
  }

  private createMarkerPopup(product: Product): string {
    return `
      <div style="width: 200px; text-align: center;">
        <img src="${
          product.image
        }" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
        <b style="color: #2d2d96;">${product.title}</b><br>
        <span style="color: #666;">$${product.price.toLocaleString()}</span><br>
        <small style="color: #888;">${product.mileage.toLocaleString()} km | ${product.city}</small>
      </div>
    `;
  }

  applyFilters() {
    this.filteredProducts = this.allProducts.filter((product) => {
      const matchesBrand = this.selectedBrand === '' || product.brand === this.selectedBrand;
      const matchesPrice = product.price >= this.minPrice && product.price <= this.maxPrice;
      const matchesYear = product.year >= this.minYear;
      return matchesBrand && matchesPrice && matchesYear;
    });

    this.updateMapMarkers();
  }

  centerOnProduct(product: Product) {
    this.map.setView([product.lat, product.lng], 13);
    this.markers[product.id]?.openPopup();
    // Scroll al mapa
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  contactProduct(product: Product) {
    // In a real app, this would open a contact form or modal
    alert(
      `¡Contactar sobre: ${product.title}\nTeléfono: +593 (2) 3814-000\nEmail: info@desarrollo.gob.ec`
    );
  }

  getBrands(): string[] {
    return Array.from(new Set(this.allProducts.map((p) => p.brand))).sort();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(price);
  }

  openFilters() {
    this.showFilters = true;
  }

  closeFilters() {
    this.showFilters = false;
  }

  clearFilters() {
    this.selectedBrand = '';
    this.minPrice = 0;
    this.maxPrice = 100000;
    this.minYear = 2010;
    this.searchRadius = 50;
    this.applyFilters();
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
