import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { map, Observable, of, switchMap } from 'rxjs';



@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailComponent implements OnInit {

  
   product$: Observable<any | null> = of(null); // todo reactivo
  shareLink = '';
  showShareModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.product$ = this.route.params.pipe(
      switchMap(params => {
        const productId = params['id'];
        return this.productService.getProductById(productId).pipe(
          map((result: any) => {
            console.log('Respuesta del backend:', result);

            if (!result?.data) {
              this.router.navigate(['/comprar']);
              return null;
            }

            const product = {
              ...result.data,
              price: Number(result.data.price),
              image: result.data.img
                ? `http://localhost:8000/uploads/${result.data.img}`
                : '',
              year: result.data.year || new Date().getFullYear(),
              featured: result.data.featured ?? false,
              location: result.data.address ?? 'Sin dirección'
            };

            this.shareLink = `${window.location.origin}/producto/${product.id}`;

            return product;
          })
        );
      })
    );
  }

  openShareModal() {
    this.showShareModal = true;
  }

  closeShareModal() {
    this.showShareModal = false;
  }

  copyLink() {
    navigator.clipboard.writeText(this.shareLink).then(() => {
      alert('Link copiado al portapapeles');
    });
  }

  contactWhatsApp(product: any) {
    if (product?.entrepreneurPhone) {
      const message = `Hola, me interesa el producto: ${product.title}. Link: ${this.shareLink}`;
      const whatsappUrl = `https://wa.me/+593${product.entrepreneurPhone.replace(/^0/, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  goBack() {
    this.router.navigate(['/comprar']);
  }

  formatPrice(price: number) {
    return `$${price.toFixed(2)}`;
  }
}
