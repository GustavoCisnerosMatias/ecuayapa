import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class ProductsComponent {
  products = [
    {
      id: 1,
      title: 'Toyota Corolla 2022',
      year: 2022,
      price: 25000,
      location: 'Quito',
      mileage: 15000,
      featured: true,
      image: 'https://via.placeholder.com/300x200?text=Toyota',
    },
    {
      id: 2,
      title: 'Chevrolet Onix 2023',
      year: 2023,
      price: 22000,
      location: 'Guayaquil',
      mileage: 8000,
      featured: true,
      image: 'https://via.placeholder.com/300x200?text=Chevrolet',
    },
    {
      id: 3,
      title: 'Hyundai i10 2021',
      year: 2021,
      price: 18000,
      location: 'Cuenca',
      mileage: 25000,
      featured: false,
      image: 'https://via.placeholder.com/300x200?text=Hyundai',
    },
    {
      id: 4,
      title: 'Kia Picanto 2023',
      year: 2023,
      price: 20000,
      location: 'Quito',
      mileage: 5000,
      featured: true,
      image: 'https://via.placeholder.com/300x200?text=Kia',
    },
    {
      id: 5,
      title: 'Renault Kwid 2022',
      year: 2022,
      price: 19000,
      location: 'Ambato',
      mileage: 12000,
      featured: false,
      image: 'https://via.placeholder.com/300x200?text=Renault',
    },
    {
      id: 6,
      title: 'Ford F-150 2023',
      year: 2023,
      price: 35000,
      location: 'Guayaquil',
      mileage: 3000,
      featured: true,
      image: 'https://via.placeholder.com/300x200?text=Ford',
    },
  ];

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(price);
  }
}
