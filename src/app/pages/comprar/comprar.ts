import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from '../../components/banner/banner';
import { ProductsComponent } from '../../components/products/products';

@Component({
  selector: 'app-comprar',
  standalone: true,
  imports: [CommonModule, ProductsComponent],
  templateUrl: './comprar.html',
  styleUrl: './comprar.scss',
})
export class ComprarComponent {}
