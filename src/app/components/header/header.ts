import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  menuItems = [
    { label: 'Comprar', route: '/comprar', icon: 'shopping-cart' },
    { label: 'Vender', route: '/vender', icon: 'plus-circle' },
    { label: 'Ver en Mapa', route: '/mapa', icon: 'map' },
  ];

  activeRoute: string = '/comprar';

  setActive(route: string) {
    this.activeRoute = route;
  }
}
