import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService, Province } from '../../services/location.service';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Sweetalert2Service } from '../../services/sweetalert2';
import * as L from 'leaflet';

@Component({
  selector: 'app-location-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-modal.html',
  styleUrl: './location-modal.scss',
})
export class LocationModalComponent implements OnInit, AfterViewInit, OnDestroy {
  
  showModal$: Observable<boolean>;
  map: L.Map | null = null;
  selectedMarker: L.Marker | null = null;
  selectedProvince: Province | null = null;
  loading = false;
  
  // Original interface properties
  showProvinceSelector = false;
  selectedRegion = 'Sierra';
  regions = ['Sierra', 'Costa', 'Oriente', 'Insular'];
  
  // Hybrid mode properties
  showMapView = false;
  provinces: Province[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    public locationService: LocationService, 
    private router: Router, 
    private alert2: Sweetalert2Service
  ) {
    this.showModal$ = this.locationService.showLocationModal$;
  }

  ngOnInit() {
    // Load provinces for list selection
    this.provinces = this.locationService.provinces;
    
    this.showModal$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isOpen) => {
        if (isOpen) {
          this.showMapView = false; // Reset to province list view
          // Only init map if map view is active
          if (this.showMapView) {
            setTimeout(() => this.initMap(), 300);
          }
        } else {
          this.destroyMap();
        }
      });
  }

  ngAfterViewInit() {
    // Map puede inicializarse aquí si es necesario
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyMap();
  }

  destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.selectedMarker = null;
    }
  }

  initMap() {
    // Si ya existe el mapa, no reinicializar
    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    const mapElement = document.getElementById('map-container');
    if (!mapElement) {
      console.warn('map-container element not found');
      return;
    }

    try {
      // Configuración del mapa centrado en Ecuador
      this.map = L.map('map-container', {
        center: [-1.831239, -78.183406], // Centro de Ecuador
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // CartoDB elegant tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '',
        maxZoom: 10,
        subdomains: 'abcd',
      }).addTo(this.map);

      // Restringir vista solo a Ecuador
      const ecuadorBounds = L.latLngBounds(
        L.latLng(1.67, -75.23),    // Noreste
        L.latLng(-5.01, -81.08)    // Suroeste
      );
      this.map.setMaxBounds(ecuadorBounds);
      this.map.fitBounds(ecuadorBounds);

      // Agregar marcadores de provincias
      this.addProvinceMarkers();

      // Agregar evento de clic en el mapa
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.addMarkerAndSelectProvince(e.latlng.lat, e.latlng.lng);
      });

      // Forzar recalcular tamaño del mapa
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 200);

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  addProvinceMarkers() {
    if (!this.map) return;

    this.locationService.provinces.forEach(province => {
      if (province.lat && province.lng) {
        const marker = L.circleMarker(
          [province.lat, province.lng], 
          {
            radius: 8,
            fillColor: '#2d2d96',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }
        ).addTo(this.map!);

        // Tooltip con el nombre de la provincia
        marker.bindTooltip(province.name, {
          permanent: false,
          direction: 'top',
          className: 'province-tooltip'
        });

        // Hover effects
        marker.on('mouseover', () => {
          marker.setStyle({
            fillColor: '#ffc003',
            radius: 10
          });
        });

        marker.on('mouseout', () => {
          marker.setStyle({
            fillColor: '#2d2d96',
            radius: 8
          });
        });

        // Click para seleccionar provincia
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          this.selectProvince(province);
        });
      }
    });
  }

  addMarkerAndSelectProvince(lat: number, lng: number) {
    if (!this.map) return;

    // Limpiar marcador anterior
    if (this.selectedMarker) {
      this.map.removeLayer(this.selectedMarker);
    }

    // Encontrar la provincia más cercana
    let closestProvince: Province | null = null;
    let minDistance = Infinity;

    this.locationService.provinces.forEach(province => {
      if (province.lat && province.lng) {
        const distance = Math.sqrt(
          Math.pow(lat - province.lat, 2) + 
          Math.pow(lng - province.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestProvince = province;
        }
      }
    });

    if (closestProvince) {
      this.selectedProvince = closestProvince;
    }

    // Crear marcador personalizado con gradiente
    const customIcon = L.divIcon({
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background: linear-gradient(45deg, #fd0118, #ff6b6b);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 3px 10px rgba(253, 1, 24, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: markerPulse 2s infinite;
        ">
          <i class="fas fa-map-pin" style="
            transform: rotate(45deg);
            color: white;
            font-size: 14px;
            margin-top: -2px;
          "></i>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
    
    this.selectedMarker = L.marker([lat, lng], {
      icon: customIcon
    }).addTo(this.map);

    // Animación de zoom suave
    this.map.flyTo([lat, lng], 8, {
      duration: 1.0
    });
  }

  // Select province from list
  selectProvinceFromList(province: Province) {
    this.selectedProvince = province;
    this.locationService.selectProvince(province);
    
    // Guardar en localStorage
    localStorage.setItem('selectedProvince', JSON.stringify(province));
    
    const currentUrl = this.router.url.split('?')[0];
    const targetUrl = (currentUrl === '' || currentUrl === '/') ? '/comprar' : currentUrl;
    
    this.closeModal();
    this.router.navigate([targetUrl], { queryParams: { provincia: province.id } });
  }

  // Toggle map view
  toggleMapView() {
    this.showMapView = !this.showMapView;
    
    if (this.showMapView) {
      // Initialize map after view is shown
      setTimeout(() => this.initMap(), 300);
    } else {
      // Clean up map when hidden
      this.destroyMap();
    }
  }

  // Select province from map (existing method)
  selectProvince(province: Province) {
    this.selectedProvince = province;
    this.locationService.selectProvince(province);
    
    // Guardar en localStorage
    localStorage.setItem('selectedProvince', JSON.stringify(province));
    
    const currentUrl = this.router.url.split('?')[0];
    const targetUrl = (currentUrl === '' || currentUrl === '/') ? '/comprar' : currentUrl;
    
    this.closeModal();
    this.router.navigate([targetUrl], { queryParams: { provincia: province.id } });
  }

  closeModal() {
    this.showMapView = false; // Reset map view
    this.showProvinceSelector = false; // Reset province selector
    this.locationService.closeLocationModal();
  }

  // Original interface methods
  async useCurrentLocation() {
    this.loading = true;
    try {
      const location = await this.locationService.getCurrentLocation();
      const nearestProvince = this.locationService.getNearestProvince(
        location.latitude,
        location.longitude
      );
      this.selectProvince(nearestProvince);
    } catch (error) {
      this.loading = false;
      this.alert2.errorToast('Error de ubicación', 'No pudimos acceder a tu ubicación. Por favor, selecciona una provincia manualmente.');
    }
  }

  getProvincesByRegion(region: string): Province[] {
    return this.locationService.getProvinceByRegion(region);
  }
}