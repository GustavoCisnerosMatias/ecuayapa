import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { RemoveStringIndexUnknownKey } from '@angular/forms/signals';
import { SweetAlertArrayOptions } from 'sweetalert2';
import { Sweetalert2Service } from '../../services/sweetalert2';
import { SpinnerComponent } from '../spinner/spinner';



@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailComponent implements OnInit {

  product: any = null;
  isLoading = true;
  shareLink = '';
  showShareModal = false;
  showFullStory = false;
  loadedImages: { [key: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cdr: ChangeDetectorRef, private Sweetalert2Service: Sweetalert2Service
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      this.loadProductDetail(productId);
    });
  }

  loadProductDetail(productId: string | number) {
    console.log('🔄 Iniciando carga de producto con ID:', productId, 'tipo:', typeof productId);
    this.isLoading = true;
    this.product = null;
    this.cdr.detectChanges();

    this.productService.getProductDetail(productId).subscribe({
      next: (soapResponse: string) => {
        console.log('📦 SOAP Response recibida, longitud:', soapResponse.length);
        const product = this.parseProductDetail(soapResponse, String(productId));
        
        if (product) {
          this.product = product;
          this.shareLink = `${window.location.origin}/producto/${product.id_product}`;
          console.log('✅ Producto cargado exitosamente:', this.product);
        } else {
          console.warn('❌ Producto no encontrado con ID:', productId, 'intentando REST API...');
          // Fallback to REST API if SOAP doesn't work
          this.loadProductFromRest(productId);
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error al cargar producto SOAP:', error);
        // Fallback to REST API
        this.loadProductFromRest(productId);
      }
    });
  }

  loadProductFromRest(productId: string | number) {
    this.productService.getProductById(String(productId)).subscribe({
      next: (result: any) => {
        if (result?.data) {
          this.product = {
            id_product: result.data.id,
            title: result.data.title,
            descriptionProduct: result.data.description,
            price: result.data.price,
            nameCategory: result.data.category,
            nameFile: result.data.img,
            node: result.data.img,
            firstName: result.data.entrepreneur_first_name || '',
            lastName: result.data.entrepreneur_last_name || '',
            nameStore: result.data.nameStore || '',
            descriptionStore: result.data.store_description || '',
            location: result.data.location || '',
            phone: result.data.phone || '',
            email: result.data.email || '',
            img: `/images/${result.data.img}`
          };
          this.shareLink = `${window.location.origin}/producto/${this.product.id_product}`;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/comprar']);
        this.cdr.detectChanges();
      }
    });
  }

  parseProductDetail(soapResponse: string, productId: string): any {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(soapResponse, 'text/xml');

      // Check for parsing errors
      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        console.error('❌ Error parsing XML');
        return null;
      }

      // Get all emprendedoresConProductos elements
      const emprendedoresArray = xmlDoc.getElementsByTagName('emprendedoresConProductos');
      console.log(`📊 Total emprendedores: ${emprendedoresArray.length}`);
      console.log(`🎯 Buscando producto con ID: "${productId}"`);

      let allProductIds: string[] = [];

      for (let i = 0; i < emprendedoresArray.length; i++) {
        const emprendedor = emprendedoresArray[i];
        
        // Get productos array within this emprendedor
        const productosArray = emprendedor.getElementsByTagName('productos');

        for (let j = 0; j < productosArray.length; j++) {
          const producto = productosArray[j];
          const idElement = producto.getElementsByTagName('idProducts')[0];
          const idStr = idElement?.textContent?.trim() || '';
          const id = String(idStr).trim();
          
          allProductIds.push(id);

          if (j < 5) { // Log first 5 products for debugging
            console.log(`  📦 Emprendedor ${i + 1}, Producto ${j + 1}: ID="${id}"`);
          }

          if (id === productId) {
            console.log('✅ ¡MATCH ENCONTRADO! Extrayendo datos...');
            const extractedData = this.extractProductData(producto, emprendedor);
            console.log('📋 Datos extraídos:', extractedData);
            return extractedData;
          }
        }
      }

      console.warn(`⚠️ Product ID "${productId}" NOT FOUND`);
      console.log('📝 IDs disponibles (primeros 20):', allProductIds.slice(0, 20));
      return null;
    } catch (error) {
      console.error('❌ Error parsing product detail:', error);
      return null;
    }
  }

  extractProductData(productElement: Element, emprendedorElement: Element): any {
    console.log('🔧 Extrayendo datos del producto...');

    const id_product = this.getText(productElement, 'idProducts');
    const title = this.getText(productElement, 'title');
    const priceStr = this.getText(productElement, 'price');
    const price = parseFloat(priceStr) || 0;
    const descriptionProduct = this.getText(productElement, 'descriptionProduct');
    const imageFileName = this.getText(productElement, 'node') || this.getText(productElement, 'nameFile');
    const nameCategory = this.getText(productElement, 'nameCategory');

    console.log('📊 Producto extraído:', {
      id_product,
      title,
      priceStr,
      price,
      nameCategory,
      imageFileName
    });

    // Entrepreneur info
    const firstName = this.getText(emprendedorElement, 'firstName');
    const lastName = this.getText(emprendedorElement, 'lastName');
    const nameStore = this.getText(emprendedorElement, 'nameStore');
    const descriptionStore = this.getText(emprendedorElement, 'descriptionStore');
    const phone = this.getText(emprendedorElement, 'phone');
    const email = this.getText(emprendedorElement, 'email');
    const nameProvincia = this.getText(emprendedorElement, 'nameProvincia');
    const nameCanton = this.getText(emprendedorElement, 'nameCanton');
    const address = this.getText(emprendedorElement, 'address');
    const location = `${address}, ${nameCanton} - ${nameProvincia}`;

    console.log('👤 Emprendedor extraído:', {
      firstName,
      lastName,
      nameStore,
      phone,
      email,
      location
    });

    const finalProduct = {
      id_product,
      title,
      price,
      descriptionProduct,
      img: this.buildImageUrl(imageFileName),
      nameFile: imageFileName,
      node: imageFileName,
      nameCategory,
      location,
      firstName,
      lastName,
      nameStore,
      descriptionStore,
      phone,
      email
    };

    console.log('🎯 Producto final:', finalProduct);
    return finalProduct;
  }

  buildImageUrl(fileName: string): string {
    if (!fileName) return '';
    return `/images/${fileName}`;
  }

  onImageLoad(imageUrl: string) {
    this.loadedImages[imageUrl] = true;
  }

  onImageError(imageUrl: string) {
    this.loadedImages[imageUrl] = false;
    console.warn('⚠️ Error loading image:', imageUrl);
  }


  openShareModal() {
    this.showShareModal = true;
  }

  closeShareModal() {
    this.showShareModal = false;
  }

  copyLink() {
    navigator.clipboard.writeText(this.shareLink).then(() => {
      this.Sweetalert2Service.success('Enlace copiado', 'El enlace del producto ha sido copiado al portapapeles.');
    });
  }

  toggleStoryExpanded() {
    this.showFullStory = !this.showFullStory;
  }

  contactWhatsApp() {
    if (this.product?.phone) {
      const message = `Hola, me interesa el producto: ${this.product.title}. Link: ${this.shareLink}`;
      const phone = this.product.phone.replace(/^0/, '593');
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  goBack() {
    this.router.navigate(['/comprar']);
  }

  getText(element: Element, tag: string): string {
    const el = element.getElementsByTagName(tag)[0];
    return el?.textContent?.trim() || '';
  }

  formatPrice(price: number) {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}
