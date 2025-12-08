import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { LocationService } from '../../services/location.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class ProductsComponent implements OnInit {
    allProducts: any[] = [];
  products: any[] = [];

  selectedProvince: string | null = null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

ngOnInit(): void {
  this.loadProducts();
 
}


loadProducts(){
 // leer la provincia del query param
  this.route.queryParams.subscribe(params => {
    this.selectedProvince = params['provincia'] ?? null;
  });

  // cargar productos
  this.productService.getProductsByProvince(1).subscribe({
    next: (result: any) => {



      if (result?.data) {
        this.allProducts = result.data.map((p: any) => ({
          ...p,
          price: Number(p.price),

          // ruta completa para que funcione localmente
          img: p.img ? `http://localhost:8000/uploads/${p.img}` : null,

          // campos que pide tu HTML pero no existen en backend
          location: p.address ?? 'Sin dirección',
          year: new Date().getFullYear(),
          featured: false
        }));

        // lista inicial
        this.products = [...this.allProducts];

        console.log("Productos cargados:", this.products);
      }
    },
    error: (err) => {
      console.error("Error cargando productos:", err);
    }
  });
}

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/producto', productId]);
  }
}
