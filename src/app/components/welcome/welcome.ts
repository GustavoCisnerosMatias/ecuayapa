import { Component, ElementRef, ViewChild, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sweetalert2Service } from '../../services/sweetalert2';


export interface Product {
  title: string | null;
  description: string | null;
  price: number | null;
  status: string | null;
  id_category: number;
  created_at: string;
  updated_at?: string | null;
  id_subcategory?: number | null;
  status_descripcion?: string | null;
  id_product: string;
  id_user?: string | null;
  id_store?: string | null;
  lat?: number;
  lng?: number;
  distance?: string;
  category_name?: string;
}
@Component({
  selector: 'app-welcome',
  imports: [CommonModule, FormsModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})


export class Welcome implements OnInit {
  markerIcon = L.divIcon({
    html: '<i class="fa-solid fa-map-pin"></i>',
    iconSize: [32, 32],
    className: 'custom-marker'
  });

  currentZoom = 6; // zoom actual del mapa

  @ViewChild('mapContainer') mapEl!: ElementRef;

  map!: L.Map;
  marker!: L.Marker | null;
  circle!: L.Circle | null;

  lat: number | null = null;
  lng: number | null = null;
  circleRadius: number = 10; // radio en km (default 10 km)

  // Ubicaciones simuladas cercanas a -0.0849, -78.4995
  nearbyLocations:  Product[] = [
  {
    title: 'Ceviche Mixto',
    description: 'Ceviche de camarón, pescado y calamar, fresco y delicioso.',
    price: 7.50,
    status: 'activo',
    id_category: 2,
    created_at: '2025-12-04T09:00:00Z',
    updated_at: null,
    id_subcategory: 5,
    status_descripcion: 'Disponible',
    id_product: 'a1b2c3d4',
    id_user: 'u001',
    id_store: 's001',
    lat: -0.085,
    lng: -78.495,
    distance: '1.2 km',
    category_name: 'Mariscos'
  },
  {
    title: 'Pan de Yuca',
    description: 'Panecillos suaves hechos con almidón de yuca y queso.',
    price: 1.25,
    status: 'activo',
    id_category: 3,
    created_at: '2025-12-03T15:30:00Z',
    updated_at: null,
    id_subcategory: 8,
    status_descripcion: 'Disponible',
    id_product: 'e5f6g7h8',
    id_user: 'u002',
    id_store: 's002',
    lat: -0.089,
    lng: -78.498,
    distance: '0.8 km',
    category_name: 'Panadería'
  },
  {
    title: 'Jugo Natural',
    description: 'Jugo de naranja recién exprimido, sin azúcar añadida.',
    price: 2.00,
    status: 'activo',
    id_category: 4,
    created_at: '2025-12-02T11:10:00Z',
    updated_at: null,
    id_subcategory: 10,
    status_descripcion: 'Disponible',
    id_product: 'i9j0k1l2',
    id_user: 'u003',
    id_store: 's003',
    lat: -0.083,
    lng: -78.492,
    distance: '2.5 km',
    category_name: 'Bebidas'
  },
  {
    title: 'Empanada de Verde',
    description: 'Empanada rellena de queso, hecha con plátano verde.',
    price: 1.75,
    status: 'activo',
    id_category: 5,
    created_at: '2025-12-01T08:45:00Z',
    updated_at: null,
    id_subcategory: 12,
    status_descripcion: 'Disponible',
    id_product: 'm3n4o5p6',
    id_user: 'u004',
    id_store: 's004',
    lat: -0.087,
    lng: -78.500,
    distance: '1.0 km',
    category_name: 'Comida Rápida'
  },
  {
    title: 'Torta de Chocolate',
    description: 'Torta casera de chocolate con cobertura de fudge.',
    price: 3.50,
    status: 'activo',
    id_category: 6,
    created_at: '2025-11-30T17:20:00Z',
    updated_at: null,
    id_subcategory: 15,
    status_descripcion: 'Disponible',
    id_product: 'q7r8s9t0',
    id_user: 'u005',
    id_store: 's005',
    lat: -0.081,
    lng: -78.496,
    distance: '3.1 km',
    category_name: 'Pastelería'
  }
];
  
  nearbyMarkers: L.Marker[] = [];
  
  // Variables para el modal
  selectedLocation: any = null;
  showModal = false;

  // Variables para búsqueda y filtrado
  searchQuery: string = '';
  filteredLocations: any[] = [];

  // Variables para filtros avanzados
  showFilterModal = false;
  selectedCategories: Set<string> = new Set();
  priceRange: { min: number; max: number } = { min: 0, max: 100 };
  availableCategories: string[] = [];

  loading = true;          // mostrar spinner
  userDenied = false;      // si el usuario negó el permiso
  permissionRequested = false; // si ya pedimos el permiso
  pointSelected = false;
  confirmed = false;
  changeLocationMode = false; // modo cambiar ubicación activado

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private sweetAlert: Sweetalert2Service
  ) {}

  ngOnInit(): void {
    // Inicializar lista filtrada
    this.filteredLocations = [...this.nearbyLocations];
    // Extraer categorías únicas
    this.availableCategories = [...new Set(this.nearbyLocations.map(loc => loc.category_name?.toString() || ''))];
  }

  ngAfterViewInit() {
    this.initMap();
    this.tryAutoLocation();
  }

  // ================================
  // Intento automático de geolocalización
  // ================================
  tryAutoLocation() {
    this.loading = true;
    this.permissionRequested = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.lat = this.round(pos.coords.latitude);
        this.lng = this.round(pos.coords.longitude);
        this.userDenied = false;

        this.ngZone.run(() => {
          this.pointSelected = true; // Marcar que ya hay una ubicación seleccionada
          this.setMarker(this.lat!, this.lng!, true);
          this.loading = false;
          this.cdr.markForCheck();
          this.sweetAlert.successToast('Ubicación obtenida', 'Tu ubicación ha sido detectada correctamente.');
        });
      },
      (err) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.userDenied = true;
          this.cdr.markForCheck();
          this.sweetAlert.warning('No se pudo obtener tu ubicación', 'Por favor, selecciona tu ubicación haciendo clic en el mapa.');
        });
      },
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 300000 }
    );
  }

  // ELIMINADO retryWithLowAccuracy() - no funciona en muchos entornos

  getCurrentLocation() {
    this.loading = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.lat = this.round(pos.coords.latitude);
        this.lng = this.round(pos.coords.longitude);
        this.userDenied = false;

        this.ngZone.run(() => {
          this.pointSelected = true; // Marcar que ya hay una ubicación seleccionada
          this.setMarker(this.lat!, this.lng!, true);
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      (err) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.userDenied = true;
          this.cdr.markForCheck();
          this.sweetAlert.warning('No se pudo obtener tu ubicación', 'Por favor, selecciona tu ubicación haciendo clic en el mapa.');
        });
      },
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 300000 }
    );
  }

  // ================================
  // Inicializar mapa
  // ================================
  initMap() {
    const defaultLat = -1.8312;
    const defaultLng = -78.1834;

    this.map = L.map(this.mapEl.nativeElement, {
      zoomControl: true
    }).setView([defaultLat, defaultLng], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    // Click en el mapa: permite cambiar ubicación si modo está activado O si el permiso fue denegado
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.changeLocationMode || (this.userDenied && !this.pointSelected)) {
        this.ngZone.run(() => {
          this.lat = this.round(e.latlng.lat);
          this.lng = this.round(e.latlng.lng);
          this.pointSelected = true;
          this.setMarker(this.lat, this.lng, true);
          this.updateNearbyLocations();
          this.changeLocationMode = false; // desactivar modo después de seleccionar
          this.cdr.detectChanges(); // forzar detección de cambios
        });
      }
    });

    // Cambiar cursor al pasar sobre el mapa (si modo está activo O si no hay ubicación)
    this.map.on('mousemove', () => {
      if (this.changeLocationMode || (this.userDenied && !this.pointSelected)) {
        this.mapEl.nativeElement.style.cursor = 'pointer';
      } else {
        this.mapEl.nativeElement.style.cursor = 'default';
      }
    });

    // Restaurar cursor al salir del mapa
    this.map.on('mouseleave', () => {
      this.mapEl.nativeElement.style.cursor = 'default';
    });

    // Listener para cambios de zoom
    this.map.on('zoom', () => {
      this.currentZoom = this.map.getZoom();
      this.updateMarkerSizes();
    });

    // Dibujar ubicaciones simuladas inicialmente
    this.drawNearbyLocations();
  }

  // ================================
  // Activar modo cambiar ubicación
  // ================================
  activateChangeLocationMode() {
    this.changeLocationMode = true;
  }

  // ================================
  // Actualizar tamaño de iconos según zoom
  // ================================
  updateMarkerSizes() {
    // Calcular tamaño dinámico: a zoom 6 = 32px, a zoom 18 = 48px
    const minZoom = 6;
    const maxZoom = 18;
    const minSize = 24;
    const maxSize = 48;
    
    const zoomRatio = (this.currentZoom - minZoom) / (maxZoom - minZoom);
    const newSize = Math.round(minSize + (maxSize - minSize) * zoomRatio);

    // Actualizar marcador principal
    if (this.marker && this.lat && this.lng) {
      const newIcon = L.divIcon({
        html: '<i class="fa-solid fa-map-pin"></i>',
        iconSize: [newSize, newSize],
        className: 'custom-marker'
      });
      this.marker.setIcon(newIcon);
    }

    // Actualizar marcadores cercanos
    this.nearbyMarkers.forEach(marker => {
      const newIcon = L.divIcon({
        html: '<i class="fa fa-shopping-basket"></i>',
        iconSize: [newSize, newSize],
        className: 'nearby-marker'
      });
      marker.setIcon(newIcon);
    });
  }

  // ================================
  // Colocar marcador
  // ================================
  setMarker(lat: number, lng: number, center = false) {
    if (this.marker) this.map.removeLayer(this.marker);
    if (this.circle) this.map.removeLayer(this.circle);

    // Marcador
    this.marker = L.marker([lat, lng], { icon: this.markerIcon }).addTo(this.map);

    // Círculo azul con radio dinámico (default 10 km)
    this.circle = L.circle([lat, lng], {
      radius: this.circleRadius * 1000, // convertir km a metros
      color: '#0066ff', // azul
      fillColor: '#0066ff',
      fillOpacity: 0.15, // transparencia
      weight: 2
    }).addTo(this.map);

    if (center) this.map.setView([lat, lng], 15);
  }

  // Actualizar radio del círculo cuando cambia el slider
  updateCircleRadius() {
    if (this.circle && this.marker && this.lat && this.lng) {
      this.map.removeLayer(this.circle);
      this.circle = L.circle([this.lat, this.lng], {
        radius: this.circleRadius * 1000,
        color: '#0066ff',
        fillColor: '#0066ff',
        fillOpacity: 0.15,
        weight: 2
      }).addTo(this.map);
    }
  }

  // ================================
  // Dibujar ubicaciones cercanas
  // ================================
  drawNearbyLocations() {
    // Limpiar marcadores anteriores
    this.nearbyMarkers.forEach(marker => {
      if (this.map.hasLayer(marker)) {
        this.map.removeLayer(marker);
      }
    });
    this.nearbyMarkers = [];

    // Crear icono para ubicaciones cercanas (diferente al marcador principal)
    const nearbyIcon = L.divIcon({
      html: '<i class="fa fa-shopping-basket"></i>',
      iconSize: [28, 28],
      className: 'nearby-marker'
    });

    // Dibujar cada ubicación simulada
    this.nearbyLocations.forEach(location => {
      const marker = L.marker([location.lat!, location.lng!], { icon: nearbyIcon }).addTo(this.map);
      
      // Tooltip al pasar mouse (hover)
      marker.bindTooltip(`<b>${location.title}</b><br><small>${location.category_name}</small><br><small>${location.distance}</small>`, {
        permanent: false,
        direction: 'top',
        offset: [0, -10]
      });
      
      // Click para abrir modal
      marker.on('click', () => {
        this.ngZone.run(() => {
          this.openLocationModal(location);
          this.cdr.markForCheck();
        });
      });
      
      this.nearbyMarkers.push(marker);
    });
  }

  // ================================
  // Modal de información detallada
  // ================================
  openLocationModal(location: any) {
    this.selectedLocation = location;
    this.showModal = true;
  }

  closeLocationModal() {
    this.showModal = false;
    this.selectedLocation = null;
  }

  // Centrar mapa en ubicación y hacer zoom
  viewLocationOnMap(location: any) {
    this.showModal = false;
    this.selectedLocation = null;
    
    // Centrar en la ubicación
    this.map.setView([location.lat, location.lng], 15);
    setTimeout(() => {
      this.map.flyTo([location.lat, location.lng], 17, { duration: 1.5 });
    }, 300);
  }

  // Actualizar ubicaciones cercanas cuando se selecciona una ubicación
  updateNearbyLocations() {
    // Por ahora simplemente redibujar, en futuro se pueden filtrar por distancia
    this.drawNearbyLocations();
  }

  confirmLocation() {
    this.confirmed = true;
    alert(`Ubicación confirmada:\nLat: ${this.lat}\nLng: ${this.lng}`);
  }

  // ================================
  // Filtrar ubicaciones por búsqueda
  // ================================
  filterLocations() {
    let filtered = [...this.nearbyLocations];

    // Filtro por búsqueda de texto
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(loc =>
        loc.title?.toLowerCase().includes(query) ||
        loc.description?.toLowerCase().includes(query) ||
        loc.category_name?.toLowerCase().includes(query)
      );
    }

    // Filtro por categorías seleccionadas
    if (this.selectedCategories.size > 0) {
      filtered = filtered.filter(loc => this.selectedCategories.has(loc.price?.toString() || ''));
    }

    // Filtro por rango de precio (extrae número del tipo si está disponible)
    filtered = filtered.filter(loc => {
      const priceMatch = loc.price?.toString().match(/\$?(\d+)/);
      if (priceMatch) {
        const price = parseInt(priceMatch[1], 10);
        return price >= this.priceRange.min && price <= this.priceRange.max;
      }
      return true;
    });

    this.filteredLocations = filtered;
  }

  toggleCategory(category: string): void {
    if (this.selectedCategories.has(category)) {
      this.selectedCategories.delete(category);
    } else {
      this.selectedCategories.add(category);
    }
    this.filterLocations();
  }

  toggleFilterModal(): void {
    this.showFilterModal = !this.showFilterModal;
  }

  resetFilters(): void {
    this.selectedCategories.clear();
    this.priceRange = { min: 0, max: 100 };
    this.filterLocations();
  }

  round(v: number) {
    return Math.round(v * 100000) / 100000;
  }
}
