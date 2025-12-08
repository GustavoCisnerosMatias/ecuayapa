import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';

interface Product {
  id: number;
  title: string;
  year: number;
  price: number;
  location: string;
  mileage: number;
  featured: boolean;
  image: string;
  description?: string;
  entrepreneurName?: string;
  entrepreneurPhone?: string;
  entrepreneurStory?: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  showShareModal = false;
  shareLink = '';

  // Datos de ejemplo - MOROCHO
  productData: { [key: number]: Product } = {
    1: {
      id: 1,
      title: 'MOROCHO',
      year: 2024,
      price: 1.0,
      location: 'Quito',
      mileage: 0,
      featured: true,
      image: 'https://via.placeholder.com/400x300?text=MOROCHO',
      description:
        'Es un producto natural, nutritivo y saludable, ideal para el desayuno o como merienda. Además, el maíz morocho es rico en fibra, vitaminas y minerales, lo que lo convierte en una excelente opción para una alimentación balanceada. Su sabor delicado y reconfortante lo convierte en una bebida muy apreciada tanto por niños como por adultos.',
      entrepreneurName: 'Leyda Alexandra Pazmiño Marcillo',
      entrepreneurPhone: '0990324356',
      entrepreneurStory:
        'Hace algunos años, mi esposo y yo decidimos seguir nuestra pasión por las artesanías de madera. Ambos compartimos el amor por la naturaleza y el trabajo manual, y nos aventuramos a crear nuestra propia empresa de piezas hechas a mano. Aunque al principio todo parecía ir bien, pronto nos dimos cuenta de que la falta de recursos limitaba nuestro crecimiento. Gracias al crédito de desarrollo humano, pudimos mejorar nuestro taller, comprar mejores herramientas y materiales de mayor calidad.',
    },
    2: {
      id: 2,
      title: 'Zapatillas Deportivas',
      year: 2024,
      price: 85,
      location: 'Guayaquil',
      mileage: 0,
      featured: true,
      image: 'https://via.placeholder.com/400x300?text=Zapatillas',
      description: 'Zapatillas deportivas de alta calidad, cómodas y duraderas.',
      entrepreneurName: 'Juan Pérez',
      entrepreneurPhone: '0987654321',
      entrepreneurStory: 'Emprendedor dedicado a la venta de artículos deportivos.',
    },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const productId = parseInt(params['id']);
      this.product = this.productData[productId] || null;

      if (this.product) {
        this.shareLink = `${window.location.origin}/producto/${productId}`;
      } else {
        this.router.navigate(['/comprar']);
      }
    });
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

  contactWhatsApp() {
    if (this.product?.entrepreneurPhone) {
      const message = `Hola, me interesa el producto: ${this.product.title}. Link: ${this.shareLink}`;
      const whatsappUrl = `https://wa.me/+593${this.product.entrepreneurPhone.replace(/^0/, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  goBack() {
    this.router.navigate(['/comprar']);
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }
}
