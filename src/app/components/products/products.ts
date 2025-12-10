import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { LocationService, Province } from '../../services/location.service';
import { Observable } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

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
  isLoading: boolean = true;

  selectedProvince: string | null = null;
  selectedProvinceName: string | null = null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private locationService: LocationService

  ) {}

ngOnInit(): void {
  this.getLocation();
}

openLocationModal() {
  this.locationService.openLocationModal();
}

getLocation(){
  // Intentar obtener la provincia del localStorage primero
  const savedProvince = localStorage.getItem('selectedProvince');
  if (savedProvince) {
    try {
      const province: Province = JSON.parse(savedProvince);
      this.selectedProvinceName = province.name;
      this.selectedProvince = province.id.toString();
      this.loadProducts();
      return;
    } catch (e) {
      console.log('Error parsing saved province');
    }
  }

  // Si no hay provincia guardada, abrir modal
  this.openLocationModal();
  this.loadProducts();
}

loadProducts(){
  // Leer la provincia del query param
  this.route.queryParams.subscribe(params => {
    const provinceId = params['provincia'] ?? null;
    if (provinceId) {
      this.selectedProvince = provinceId;
      
      // Obtener el nombre de la provincia desde el servicio
      const province = this.locationService.provinces.find(p => p.id == provinceId);
      if (province) {
        this.selectedProvinceName = province.name;
      }
    }
  });

  // Cargar productos
  this.isLoading = true;
  this.productService.getEmprendedoresConProductosPaginado().subscribe({
    next: (result: any) => {
      console.log(result);
      // Asignar productos del resultado de la API
      this.products = result?.data || [];
      this.allProducts = this.products;
      this.isLoading = false;
    },
    error: (err) => {
      console.error("Error cargando productos:", err);
      // En caso de error, mostrar array vacío
      this.products = [];
      this.allProducts = [];
      this.isLoading = false;
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
