import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  contactInfo = [
    { icon: 'phone', text: '+593-2398-3100' },
    { icon: 'map-marker-alt', text: 'Av. Amaru Ñan, Quito 170146. Piso 5 Plataforma Gubernamental de Desarrollo Social.' },
  ];

  socialLinks = [
    { icon: 'facebook-f', url: '#' },
    { icon: 'x', url: '#' },
    { icon: 'instagram', url: '#' },

  ];
}
