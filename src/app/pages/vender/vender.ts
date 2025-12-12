
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService, Province, Canton, Parish } from '../../services/location.service';

interface DaySchedule {
  open: boolean;
  from: string; // formato 'HH:mm'
  to: string;   // formato 'HH:mm'
}

interface SellerInfo {
  cedula: string;
  firstName: string;
  lastName: string;
  storeName: string;
  province: string;
  canton: string;
  parish: string;
  address: string;
  phone: string;
  email: string;
  history: string;
  schedule: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
  storeImage: File | null;
  storeImagePreview: string;
}

interface Product {
  id: number;
  category: string;
  subcategory: string;
  name: string;
  price: number | null;
  description: string;
  image: File | null;
  imagePreview: string;
}

@Component({
  selector: 'app-vender',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vender.html',
  styleUrl: './vender.scss',
})
export class VenderComponent {
  // Paso actual (1 = Emprendedor, 2 = Productos)
  currentStep = 1;

  // Categorías disponibles
  categories = [
    { id: 1, name: 'Agropecuaria', subcategories: ['Cultivo de plantas', 'Ganadería', 'Insumos agrícolas', 'Maquinaria'] },
    { id: 2, name: 'Alimentos', subcategories: ['Dulces', 'Snacks', 'Bebidas', 'Comida preparada', 'Productos orgánicos'] },
    { id: 3, name: 'Artesanías', subcategories: ['Joyería', 'Textiles', 'Cerámica', 'Madera', 'Cuero'] },
    { id: 4, name: 'Moda', subcategories: ['Ropa', 'Calzado', 'Accesorios', 'Bolsos', 'Sombreros'] },
    { id: 5, name: 'Servicios', subcategories: ['Belleza', 'Reparaciones', 'Consultoría', 'Educación', 'Transporte'] },
    { id: 6, name: 'Tecnología', subcategories: ['Celulares', 'Computadoras', 'Accesorios', 'Reparación'] },
  ];

  // Provincias, cantones y parroquias
  provinces: Province[] = [];
  cantons: Canton[] = [];
  parishes: Parish[] = [];

  // Información del vendedor
  seller: SellerInfo = {
    cedula: '',
    firstName: '',
    lastName: '',
    storeName: '',
    province: '',
    canton: '',
    parish: '',
    address: '',
    phone: '',
    email: '',
    history: '',
    schedule: {
      monday: { open: true, from: '08:00', to: '19:00' },
      tuesday: { open: true, from: '08:00', to: '19:00' },
      wednesday: { open: true, from: '08:00', to: '19:00' },
      thursday: { open: true, from: '08:00', to: '19:00' },
      friday: { open: true, from: '08:00', to: '19:00' },
      saturday: { open: true, from: '09:00', to: '17:00' },
      sunday: { open: false, from: '', to: '' },
    },
    storeImage: null,
    storeImagePreview: '',
  };

  // Productos (máximo 5)
  products: Product[] = [];
  maxProducts = 5;

  // Validación
  errors: { [key: string]: string } = {};

  constructor(private locationService: LocationService) {
    console.log('🏢 Vender constructor - Cargando provincias...');
    
    // Cargar provincias dinámicamente desde SOAP
    this.locationService.loadProvincesFromSOAP().subscribe({
      next: (provinces) => {
        this.provinces = provinces;
      },
      error: (err) => {
        console.error('❌ Error en vender cargando provincias:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          statusText: err.statusText,
          url: err.url
        });
        this.provinces = [];
      },
      complete: () => {
        console.log('✓ Carga de provincias completada en vender');
      }
    });
    
    this.addProduct(); // Iniciar con un producto vacío
  }

  // Cambio de provincia - cargar cantones dinámicamente
  onProvinceChange(): void {
    console.log('🔄 Provincia seleccionada:', this.seller.province);
    this.seller.canton = '';
    this.seller.parish = '';
    this.cantons = [];
    this.parishes = [];
    
    const selectedProvince = this.provinces.find(p => p.name === this.seller.province);
    if (selectedProvince) {
      console.log(`📍 Cargando cantones para provincia: ${selectedProvince.name} (ID: ${selectedProvince.id})`);
      this.locationService.loadCantonsByProvince(selectedProvince.id).subscribe({
        next: (cantones) => {
          console.log('✅ Cantones cargados:', cantones);
          this.cantons = cantones;
        },
        error: (err) => {
          console.error('❌ Error cargando cantones:', err);
          this.cantons = [];
        },
        complete: () => {
          console.log('✓ Carga de cantones completada');
        }
      });
    } else {
      console.warn('⚠️ Provincia no encontrada:', this.seller.province);
    }
  }

  // Cambio de cantón - cargar parroquias dinámicamente
  onCantonChange(): void {
    console.log('🔄 Cantón seleccionado:', this.seller.canton);
    this.seller.parish = '';
    this.parishes = [];
    
    const selectedCanton = this.cantons.find(c => c.name === this.seller.canton);
    if (selectedCanton) {
      console.log(`📍 Cargando parroquias para cantón: ${selectedCanton.name} (ID: ${selectedCanton.id})`);
      this.locationService.loadParishesByCanton(selectedCanton.id).subscribe({
        next: (parroquias) => {
          console.log('✅ Parroquias cargadas:', parroquias);
          this.parishes = parroquias;
        },
        error: (err) => {
          console.error('❌ Error cargando parroquias:', err);
          this.parishes = [];
        },
        complete: () => {
          console.log('✓ Carga de parroquias completada');
        }
      });
    } else {
      console.warn('⚠️ Cantón no encontrado:', this.seller.canton);
    }
  }

  // Obtener subcategorías para una categoría
  getSubcategories(categoryName: string): string[] {
    const cat = this.categories.find(c => c.name === categoryName);
    return cat ? cat.subcategories : [];
  }

  // Agregar producto
  addProduct(): void {
    if (this.products.length < this.maxProducts) {
      this.products.push({
        id: Date.now(),
        category: '',
        subcategory: '',
        name: '',
        price: null,
        description: '',
        image: null,
        imagePreview: '',
      });
    }
  }

  // Eliminar producto
  removeProduct(index: number): void {
    if (this.products.length > 1) {
      this.products.splice(index, 1);
    }
  }

  // Manejar imagen de tienda
  onStoreImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.seller.storeImage = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.seller.storeImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // Manejar imagen de producto
  onProductImageChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.products[index].image = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.products[index].imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // Validar paso 1
  validateStep1(): boolean {
    this.errors = {};
    
    if (!this.seller.cedula || this.seller.cedula.length !== 10) {
      this.errors['cedula'] = 'Ingresa una cédula válida de 10 dígitos';
    }
    if (!this.seller.firstName.trim()) {
      this.errors['firstName'] = 'Ingresa tu nombre';
    }
    if (!this.seller.lastName.trim()) {
      this.errors['lastName'] = 'Ingresa tu apellido';
    }
    if (!this.seller.storeName.trim()) {
      this.errors['storeName'] = 'Ingresa el nombre de tu emprendimiento';
    }
    if (!this.seller.province) {
      this.errors['province'] = 'Selecciona una provincia';
    }
    if (!this.seller.canton) {
      this.errors['canton'] = 'Selecciona un cantón';
    }
    if (!this.seller.phone || this.seller.phone.length < 10) {
      this.errors['phone'] = 'Ingresa un número de celular válido';
    }
    if (!this.seller.email || !this.seller.email.includes('@')) {
      this.errors['email'] = 'Ingresa un correo electrónico válido';
    }

    return Object.keys(this.errors).length === 0;
  }

  // Validar paso 2
  validateStep2(): boolean {
    this.errors = {};
    
    for (let i = 0; i < this.products.length; i++) {
      const p = this.products[i];
      if (!p.category) {
        this.errors[`product_${i}_category`] = 'Selecciona una categoría';
      }
      if (!p.name.trim()) {
        this.errors[`product_${i}_name`] = 'Ingresa el nombre del producto';
      }
      if (!p.price || p.price <= 0) {
        this.errors[`product_${i}_price`] = 'Ingresa un precio válido';
      }
    }

    return Object.keys(this.errors).length === 0;
  }

  // Ir al siguiente paso
  nextStep(): void {
    if (this.currentStep === 1 && this.validateStep1()) {
      this.currentStep = 2;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Ir al paso anterior
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Enviar formulario
  submitForm(): void {
    if (this.validateStep2()) {
      const formData = {
        seller: this.seller,
        products: this.products,
      };
      
      console.log('Datos del formulario:', formData);
      
      // Aquí iría la lógica para enviar al backend
      alert('¡Tu información ha sido enviada correctamente! Pronto revisaremos tu solicitud.');
    }
  }

  // Track by para ngFor
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  // Acceso seguro a los días para el template
  getDaySchedule(day: string): DaySchedule {
    return (this.seller.schedule as any)[day];
  }
}
