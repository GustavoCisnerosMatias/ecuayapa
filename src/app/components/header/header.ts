import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  constructor(private locationService: LocationService) {}
  menuItems: Array<{
    label: string;
    route?: string; // opcional porque los modales no tienen ruta
    icon: string;
    isModal?: boolean;
  }> = [
    { label: 'Comprar', route: '/comprar', icon: 'shopping-cart' },
    { label: 'Vender', route: '/vender', icon: 'plus-circle' },
    { label: 'Ver en Mapa', route: '/mapa', icon: 'map' },
    { label: 'Cambiar Ubicación', icon: 'map', isModal: true },
  ];



  activeRoute: string = '/comprar';

  setActive(route: string) {
    this.activeRoute = route;
  }
  openLocationModal() {
    this.locationService.openLocationModal();
  }

}
