import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink ,RouterLinkActive} from '@angular/router';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  constructor(private locationService: LocationService) {}




  activeRoute: string = '/comprar';

  setActive(route: string) {
    this.activeRoute = route;
  }





  menuItems: Array<{
    label: string;
    route?: string;
    icon: string;
    isModal?: boolean;
  }> = [
    { label: 'Comprar', route: '/comprar', icon: 'shopping-cart' },
    { label: 'Vender', route: '/vender', icon: 'plus-circle' },
    { label: 'Ver en Mapa', route: '/mapa', icon: 'map' },
    // { label: 'Cambiar Ubicación', icon: 'fa fa-map-marker', isModal: true },
  ];

  openLocationModal() {
    this.locationService.openLocationModal();
  }

}
