import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { Router } from '@angular/router';

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

  constructor(private locationService: LocationService, private router: Router) {}

  openLocationModal() {
    this.locationService.openLocationModal();
  }

  navigateToComprar() {
    this.router.navigate(['/comprar']);
  }

  navigateToVender() {
    this.router.navigate(['/vender']);
  }
}
