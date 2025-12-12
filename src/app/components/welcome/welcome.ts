import { Component, ElementRef, ViewChild, OnInit, NgZone, ChangeDetectorRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sweetalert2Service } from '../../services/sweetalert2';
import { ProductService } from '../../services/product.service';
import { SpinnerComponent } from '../spinner/spinner';


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
  seller_name?: string; // Nombre del vendedor
  seller_province?: string; // Provincia del vendedor
}
@Component({
  selector: 'app-welcome',
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.scss'],
  encapsulation: ViewEncapsulation.None
})


export class Welcome implements OnInit {
  // Coordenadas de provincias ecuatorianas para ubicaciones aleatorias
  private ecuadorProvinces = [
    { name: 'Pichincha', lat: -0.2193, lng: -78.5125 },
    { name: 'Guayas', lat: -2.17, lng: -79.92 },
    { name: 'Azuay', lat: -2.90, lng: -79.00 },
    { name: 'Tungurahua', lat: -1.24, lng: -78.63 },
    { name: 'Manabí', lat: -0.95, lng: -80.73 },
    { name: 'El Oro', lat: -3.29, lng: -79.97 },
    { name: 'Esmeraldas', lat: 0.96, lng: -79.66 },
    { name: 'Imbabura', lat: 0.35, lng: -78.12 },
    { name: 'Cotopaxi', lat: -0.93, lng: -78.61 },
    { name: 'Chimborazo', lat: -1.67, lng: -78.65 },
    { name: 'Santa Elena', lat: -2.21, lng: -80.38 }
  ];
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
    category_name: 'Mariscos',
    seller_name: 'María González',
    seller_province: 'Pichincha'
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
    id_product: '1',
    id_user: 'u002',
    id_store: 's002',
    lat: -0.089,
    lng: -78.498,
    distance: '0.8 km',
    category_name: 'Panadería',
    seller_name: 'Carlos Pérez',
    seller_province: 'Guayas'
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
    category_name: 'Bebidas',
    seller_name: 'Ana Rodríguez',
    seller_province: 'Azuay'
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
    category_name: 'Comida Rápida',
    seller_name: 'José López',
    seller_province: 'Manabí'
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
    category_name: 'Pastelería',
    seller_name: 'Laura Mendoza',
    seller_province: 'Santa Elena'
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
    private sweetAlert: Sweetalert2Service,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProductsFromBackend();
    this.availableCategories = [...new Set(this.nearbyLocations.map(loc => loc.category_name?.toString() || ''))];
  }

  // Cargar productos del backend y asignarles ubicaciones aleatorias
  loadProductsFromBackend(): void {
    this.loading = true;
    this.productService.getProductByIdSOAP().subscribe({
      next: (soapResponse: string) => {
        this.parseAndEnrichProducts(soapResponse);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        // Si hay error, usar datos de demostración
        this.nearbyLocations.forEach(product => {
          product.lat = this.getRandomLatitude();
          product.lng = this.getRandomLongitude();
        });
        this.filteredLocations = [...this.nearbyLocations];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Parsear productos SOAP y asignar ubicaciones aleatorias
  parseAndEnrichProducts(soapXml: string): void {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(soapXml, 'text/xml');
      const emprendedores = xmlDoc.getElementsByTagName('emprendedoresConProductos');
      const productsList: Product[] = [];

      for (let i = 0; i < emprendedores.length; i++) {
        const emp = emprendedores[i];
        
        const firstName = emp.getElementsByTagName('firstName')[0]?.textContent || '';
        const lastName = emp.getElementsByTagName('lastName')[0]?.textContent || '';
        const nameProvincia = emp.getElementsByTagName('nameProvincia')[0]?.textContent || '';
        const nameCanton = emp.getElementsByTagName('nameCanton')[0]?.textContent || '';
        const address = emp.getElementsByTagName('address')[0]?.textContent || '';

        const productos = emp.getElementsByTagName('productos');
        
        for (let j = 0; j < productos.length; j++) {
          const prod = productos[j];
          
          // Obtener coordenadas aleatorias cerca de la provincia
          const randomCoords = this.getRandomCoordsNearProvince(nameProvincia);
          const distance = this.calculateDistanceKm(-0.2193, -78.5125, randomCoords.lat, randomCoords.lng);
          
          const product: Product = {
            title: prod.getElementsByTagName('title')[0]?.textContent || 'Producto',
            description: prod.getElementsByTagName('descriptionProduct')[0]?.textContent || '',
            price: parseFloat(prod.getElementsByTagName('price')[0]?.textContent || '0'),
            status: 'activo',
            id_category: 0,
            created_at: new Date().toISOString(),
            id_product: prod.getElementsByTagName('idProducts')[0]?.textContent || '',
            id_user: emp.getElementsByTagName('id_user')[0]?.textContent || '',
            category_name: prod.getElementsByTagName('nameCategory')[0]?.textContent || '',
            lat: randomCoords.lat,
            lng: randomCoords.lng,
            distance: this.formatDistance(distance),
            seller_name: `${firstName} ${lastName}`.trim() || 'Vendedor',
            seller_province: nameProvincia || 'Ecuador',
          };
          
          productsList.push(product);
        }
      }

      if (productsList.length > 0) {
        // Ordenar por distancia (más cercanos primero)
        productsList.sort((a, b) => {
          const distA = parseFloat(a.distance || '0');
          const distB = parseFloat(b.distance || '0');
          return distA - distB;
        });

        // Limitar a máximo 15 productos
        this.nearbyLocations = productsList.slice(0, 15);
        this.filteredLocations = [...this.nearbyLocations];
        this.availableCategories = [...new Set(this.nearbyLocations.map(loc => loc.category_name?.toString() || ''))];
        
        // Dibujar progresivamente los marcadores
        this.drawNearbyLocationsProgressively();
      }
    } catch (error) {
      console.error('Error parseando productos:', error);
      this.nearbyLocations.forEach(product => {
        product.lat = this.getRandomLatitude();
        product.lng = this.getRandomLongitude();
      });
      this.filteredLocations = [...this.nearbyLocations];
      this.drawNearbyLocationsProgressively();
    }
  }

  // Dibujar marcadores progresivamente
  drawNearbyLocationsProgressively(): void {
    // No hacer nada si el mapa no está inicializado
    if (!this.map) return;

    // Limpiar marcadores anteriores
    this.nearbyMarkers.forEach(marker => {
      if (this.map.hasLayer(marker)) {
        this.map.removeLayer(marker);
      }
    });
    this.nearbyMarkers = [];

    // Dibujar cada marcador con delay progresivo
    this.filteredLocations.forEach((location, index) => {
      setTimeout(() => {
        this.addMarkerToMap(location);
        this.cdr.detectChanges();
      }, index * 150); // 150ms de delay entre cada marcador
    });
  }

  // Agregar un marcador al mapa
  addMarkerToMap(location: Product): void {
    if (!location.lat || !location.lng || !this.map) return;
    
    // Crear icono con el ícono de pin de compra
    const nearbyIcon = L.divIcon({
      html: '<i class="fas fa-shopping-basket" style="color: #2d2d96; font-size: 20px;"></i>',
      iconSize: [32, 32],
      className: 'nearby-marker',
      iconAnchor: [16, 16]
    });

    const marker = L.marker([location.lat, location.lng], { icon: nearbyIcon }).addTo(this.map);
    
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
      });
    });
    
    this.nearbyMarkers.push(marker);
  }

  // Generar coordenadas aleatorias cercanas a una provincia
  getRandomCoordsNearProvince(provinceName: string): { lat: number; lng: number } {
    const province = this.ecuadorProvinces.find(p => p.name.toLowerCase().includes(provinceName.toLowerCase())) || this.ecuadorProvinces[0];
    
    // Agregar variación aleatoria (±0.5 grados = ±55 km aproximadamente)
    const variation = 0.5;
    const lat = province.lat + (Math.random() - 0.5) * variation;
    const lng = province.lng + (Math.random() - 0.5) * variation;
    
    return { lat: this.round(lat), lng: this.round(lng) };
  }

  // Generar latitud aleatoria en Ecuador (-5 a 2)
  getRandomLatitude(): number {
    return this.round(Math.random() * 7 - 5);
  }

  // Generar longitud aleatoria en Ecuador (-81 a -75)
  getRandomLongitude(): number {
    return this.round(Math.random() * 6 - 81);
  }

  // Calcular distancia entre dos puntos (fórmula Haversine) - retorna km
  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Formatear distancia como string
  formatDistance(distanceKm: number): string {
    return distanceKm.toFixed(1) + ' km';
  }

  // Calcular distancia entre dos puntos (fórmula Haversine) - retorna string formateado
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
    const distanceKm = this.calculateDistanceKm(lat1, lon1, lat2, lon2);
    return this.formatDistance(distanceKm);
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
          //this.sweetAlert.warning('No se pudo obtener tu ubicación', 'Por favor, selecciona tu ubicación haciendo clic en el mapa.');
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

    // Usar setTimeout para asegurar que el mapa se renderice antes de agregar listeners
    setTimeout(() => {
      // Click en el mapa: permite cambiar ubicación si modo está activado O si el permiso fue denegado
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        if (this.changeLocationMode || (this.userDenied && !this.pointSelected)) {
          this.ngZone.run(() => {
            this.lat = this.round(e.latlng.lat);
            this.lng = this.round(e.latlng.lng);
            console.log(`Ubicación seleccionada: ${this.lat}, ${this.lng}`);
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
      
      // Forzar actualización visual
      this.cdr.detectChanges();
    }, 200); // Esperar 200ms para que el mapa se estabilice completamente
    
    // Forzar el reajuste del mapa después de la inicialización
    setTimeout(() => {
      this.map.invalidateSize();
    }, 300);
  }

  // ================================
  // Activar modo cambiar ubicación
  // ================================
  activateChangeLocationMode() {
    this.changeLocationMode = true;
    this.cdr.detectChanges();
    this.sweetAlert.successToast('Modo activado', 'Haz clic en el mapa para seleccionar una nueva ubicación');
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
        html: '<i class="fa-solid fa-map-pin fa-2x"></i>',
        iconSize: [newSize, newSize],
        className: 'custom-marker'
      });
      this.marker.setIcon(newIcon);
    }

    // Actualizar marcadores cercanos
    this.nearbyMarkers.forEach(marker => {
      const newIcon = L.divIcon({
        html: '<i class="fa fa-shopping-basket fa-2x"></i>',
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
    // Actualizar ubicaciones cercanas cuando cambia el radio
    this.updateNearbyLocations();
  }

  // ================================
  // Dibujar ubicaciones cercanas
  // ================================
  drawNearbyLocations() {
    // Usar el método progresivo siempre
    this.drawNearbyLocationsProgressively();
  }

  // ================================
  // Modal de información detallada
  // ================================
  openLocationModal(location: any) {
    this.selectedLocation = location;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeLocationModal() {
    this.showModal = false;
    this.selectedLocation = null;
  }

  // Centrar mapa en ubicación y hacer zoom
  viewLocationOnMap(location: any) {
    // Cerrar modal
    this.showModal = false;
    this.selectedLocation = null;
    
    // Verificar que el mapa existe
    if (!this.map || !location.lat || !location.lng) {
      console.error('Mapa no inicializado o coordenadas inválidas');
      return;
    }
    
    // Centrar en la ubicación con animación
    setTimeout(() => {
      this.map.flyTo([location.lat, location.lng], 17, { duration: 1.5 });
      
      // Mostrar toast de confirmación
      this.sweetAlert.successToast('Ubicación encontrada', `Mostrando ${location.title} en el mapa`);
    }, 100);
  }

  // Actualizar ubicaciones cercanas cuando se selecciona una ubicación
  updateNearbyLocations() {
    if (!this.lat || !this.lng) return;

    // Recalcular distancias para todos los productos desde la nueva ubicación
    this.nearbyLocations.forEach(product => {
      if (product.lat && product.lng) {
        const distance = this.calculateDistanceKm(this.lat!, this.lng!, product.lat, product.lng);
        product.distance = this.formatDistance(distance);
      }
    });

    // Filtrar productos dentro del rango del círculo
    const productsInRange = this.nearbyLocations.filter(product => {
      if (!product.lat || !product.lng) return false;
      const distance = this.calculateDistanceKm(this.lat!, this.lng!, product.lat, product.lng);
      return distance <= this.circleRadius;
    });

    // Ordenar por distancia
    productsInRange.sort((a, b) => {
      const distA = parseFloat(a.distance || '0');
      const distB = parseFloat(b.distance || '0');
      return distA - distB;
    });

    // Limitar a máximo 15 productos
    this.filteredLocations = productsInRange.slice(0, 15);
    
    // Redibujar marcadores progresivamente
    this.drawNearbyLocationsProgressively();
  }

  confirmLocation() {
    this.confirmed = true;
    // Guardar ubicación en localStorage
    const locationData = {
      lat: this.lat,
      lng: this.lng,
      circleRadius: this.circleRadius,
      timestamp: new Date().toISOString()
    };
    console.log(locationData)
    localStorage.setItem('ecuayapa_location', JSON.stringify(locationData));
    
    // Mostrar alerta de éxito y redirigir a comprar
    this.sweetAlert.successToast('Ubicación guardada', 'Preparando para explorar...');
    setTimeout(() => {
      this.router.navigate(['/comprar']);
    }, 1500);
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

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  viewProduct(productId: string) {
    // Cerrar modal antes de navegar
    this.showModal = false;
    this.selectedLocation = null;
    
    // Navegar al detalle del producto
    this.router.navigate(['/producto', productId]);
  }
}
