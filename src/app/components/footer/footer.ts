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
    { icon: 'phone', text: '+593 (2) 3814-000' },
    { icon: 'envelope', text: 'info@desarrollo.gob.ec' },
    { icon: 'map-marker-alt', text: 'Av. Amazonas y Atahualpa, Quito' },
  ];

  socialLinks = [
    { icon: 'facebook-f', url: '#' },
    { icon: 'twitter', url: '#' },
    { icon: 'instagram', url: '#' },
    { icon: 'linkedin-in', url: '#' },
  ];
}
