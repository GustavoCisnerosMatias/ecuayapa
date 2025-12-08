import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    subtitle: 'Compra, vende y encuentra vehículos en todo el Ecuador',
    cta: 'Explorar Ahora',
  };
}
