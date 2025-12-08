import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService, Province } from '../../services/location.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-location-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-modal.html',
  styleUrl: './location-modal.scss',
})
export class LocationModalComponent implements OnInit {
  showModal$: Observable<boolean>;
  showProvinceSelector = false;
  loading = false;
  selectedRegion = 'Sierra';
  regions = ['Sierra', 'Costa', 'Oriente', 'Insular'];

  constructor(public locationService: LocationService, private router: Router) {
    this.showModal$ = this.locationService.showLocationModal$;
  }

  ngOnInit() {}

  closeModal() {
    this.locationService.closeLocationModal();
    this.showProvinceSelector = false;
  }

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
      console.error('Error al obtener ubicación:', error);
      alert('No pudimos acceder a tu ubicación. Por favor, selecciona una provincia manualmente.');
      this.loading = false;
    }
  }

  selectProvince(province: Province) {
    this.locationService.selectProvince(province);
    // Redirigir a comprar con la provincia
    this.router.navigate(['/comprar'], { queryParams: { provincia: province.id } });
  }

  getProvincesByRegion(region: string): Province[] {
    return this.locationService.getProvinceByRegion(region);
  }
}
