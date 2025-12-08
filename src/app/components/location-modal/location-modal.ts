import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService, Province } from '../../services/location.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Sweetalert2Service } from '../../services/sweetalert2';

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

  constructor(public locationService: LocationService, private router: Router, private alert2: Sweetalert2Service ) {
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
      this.loading = false;

      this.alert2.errorToast('Error de ubicación', 'No pudimos acceder a tu ubicación. Por favor, selecciona una provincia manualmente.');

    }
  }


  selectProvince(province: Province) {
    this.locationService.selectProvince(province);

    const currentUrl = this.router.url.split('?')[0]; 

    const targetUrl = (currentUrl === '' || currentUrl === '/') ? '/comprar' : currentUrl;

    this.router.navigate([targetUrl], { queryParams: { provincia: province.id } });

    this.closeModal();
  }



  getProvincesByRegion(region: string): Province[] {
    return this.locationService.getProvinceByRegion(region);
  }
}
