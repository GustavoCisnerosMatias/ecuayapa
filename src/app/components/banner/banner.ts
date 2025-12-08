import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
})
export class BannerComponent {
  bannerText = {
    title: 'BIENVENIDO A ECUAYAPA',
    subtitle: 'Compra, vende y encuentra productos en todo el Ecuador',
    cta: 'Comprar',
  };

  constructor(private locationService: LocationService) {}

  openLocationModal() {
    this.locationService.openLocationModal();
  }
}
