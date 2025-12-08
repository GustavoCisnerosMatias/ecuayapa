import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class ProductsComponent implements OnInit {
  allProducts = [
    {
      id: 1,
      title: 'Camiseta Premium Azul',
      year: 2024,
      price: 25,
      location: 'Quito',
      mileage: 0,
      featured: true,
      image: 'https://via.placeholder.com/300x200?text=Camiseta',
    },
    {
      id: 2,
      title: 'Zapatillas Deportivas',
      year: 2024,
      price: 85,
      location: 'Guayaquil',
      mileage: 0,
      featured: true,
      image: 'https://via.placeholder.com/300x200?text=Zapatillas',
    },
    {
      id: 3,
      title: 'Medias Algodón Pack 6',
      year: 2024,
      price: 12,
      location: 'Cuenca',
      mileage: 0,
      featured: false,
      image: 'https://via.placeholder.com/300x200?text=Medias',
    },
    {
      id: 4,
      title: 'Pantalón Jean Premium',
      year: 2024,
      price: 65,
      location: 'Quito',
      mileage: 0,
      featured: true,
      image: 'https://via.placeholder.com/300x200?text=Pantalon',
    },
    {
      id: 5,
      title: 'Chocolate Artesanal 100g',
      year: 2024,
      price: 8,
      location: 'Ambato',
      mileage: 0,
      featured: false,
      image: 'https://via.placeholder.com/300x200?text=Chocolate',
    },
    {
      id: 6,
      title: 'Café Gourmet Molido',
      year: 2024,
      price: 18,
      location: 'Guayaquil',
      mileage: 0,
      featured: true,
      image: 'https://via.placeholder.com/300x200?text=Cafe',
    },
  ];

  products = this.allProducts;
  selectedProvince: string | null = null;

  constructor(
    private productService: ProductService,
    private locationService: LocationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Buscar provincia en query params
    this.route.queryParams.subscribe((params) => {
      if (params['provincia']) {
        this.selectedProvince = params['provincia'];
        this.filterByProvince();
      } else {
        this.products = this.allProducts;
      }
    });
  }

  filterByProvince() {
    if (this.selectedProvince) {
      this.products = this.productService.highlightProductsByProvince(
        this.allProducts,
        this.selectedProvince
      );
    } else {
      this.products = this.allProducts;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(price);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  viewProduct(productId: number) {
    this.router.navigate(['/producto', productId]);
  }
}
