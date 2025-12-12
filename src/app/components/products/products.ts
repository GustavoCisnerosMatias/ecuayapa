import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { LocationService, Province } from '../../services/location.service';
import { Observable } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  allProducts: any[] = [];
  products: any[] = [];
  paginatedProducts: any[] = [];
  isLoading: boolean = true;
  private spinnerStartTime: number = 0;
  private spinnerTimeout: any = null;

  // Vistas: 'home' (secciones por categoría) o 'grid' (todos los productos)
  currentView: 'home' | 'grid' = 'home';
  selectedCategoryView: string | null = null;

  // Paginación
  currentPage: number = 1;
  productsPerPage: number = 12; // 4 filas x 3 columnas
  totalPages: number = 1;
  Math = Math; // Exponer Math para el template

  selectedProvince: string | null = null;
  selectedProvinceName: string = 'Quito - Ecuador';

  // Provincias para selector
  provinces: Province[] = [];
  showProvinceDropdown: boolean = false;

  // Filtros
  showFilters: boolean = false;
  filters = {
    searchText: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    selectedCategories: [] as string[]
  };
  availableCategories: string[] = [];

  // Productos agrupados por categoría (para vista home)
  categoryGroups: { category: string; products: any[] }[] = [];
  categoryPriority = [
    'Alimentos y Bebidas',
    'Manufactura',
    'Comercio',
    'Agropecuaria',
    'Cultivo de Plantas',
    'Actividades de Peluquería y Otros Tratamientos de Belleza',
    'Cría y Reproducción de Cerdos',
    'Otras Actividades de Servicio'
  ];

  // Buscador de provincias
  provinceSearch: string = '';
  get filteredProvinces(): Province[] {
    if (!this.provinceSearch.trim()) return this.provinces;
    return this.provinces.filter(p => p.name.toLowerCase().includes(this.provinceSearch.toLowerCase()));
  }

  // Mostrar botón ir arriba
  showScrollTop: boolean = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private locationService: LocationService

  ) {}

ngOnInit(): void {
  // Cargar provincias del servicio
  this.provinces = this.locationService.provinces;
  this.showSpinnerMin3s(() => this.loadProductsFromSOAP());
}


loadProductsFromSOAP() {
  this.productService.getProductByIdSOAP().subscribe({
    next: (soapResponse: string) => {
      console.log('Respuesta SOAP recibida');
      this.parseAndLoadProducts(soapResponse);
      this.hideSpinnerMin3s();
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error en SOAP:', err);
      this.hideSpinnerMin3s();
      this.cdr.detectChanges();
    }
  });
}

// Controla que el spinner esté al menos 3 segundos
showSpinnerMin3s(loadFn: () => void) {
  this.isLoading = true;
  this.spinnerStartTime = Date.now();
  loadFn();
}

hideSpinnerMin3s() {
  const elapsed = Date.now() - this.spinnerStartTime;
  const minDuration = 3000;
  if (elapsed >= minDuration) {
    this.isLoading = false;
  } else {
    if (this.spinnerTimeout) clearTimeout(this.spinnerTimeout);
    this.spinnerTimeout = setTimeout(() => {
      this.isLoading = false;
      this.spinnerTimeout = null;
      this.cdr.detectChanges();
    }, minDuration - elapsed);
  }
}

parseAndLoadProducts(soapXml: string) {
  try {
    // Parsear XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(soapXml, 'text/xml');

    // Extraer todos los emprendedoresConProductos
    const emprendedores = xmlDoc.getElementsByTagName('emprendedoresConProductos');
    const productsList: any[] = [];

    for (let i = 0; i < emprendedores.length; i++) {
      const emp = emprendedores[i];
      
      // Datos del emprendedor
      const firstName = emp.getElementsByTagName('firstName')[0]?.textContent || '';
      const lastName = emp.getElementsByTagName('lastName')[0]?.textContent || '';
      const nameStore = emp.getElementsByTagName('nameStore')[0]?.textContent || '';
      const descriptionStore = emp.getElementsByTagName('descriptionStore')[0]?.textContent || '';
      const nameProvincia = emp.getElementsByTagName('nameProvincia')[0]?.textContent || '';
      const nameCanton = emp.getElementsByTagName('nameCanton')[0]?.textContent || '';
      const address = emp.getElementsByTagName('address')[0]?.textContent || '';
      const phone = emp.getElementsByTagName('phone')[0]?.textContent || '';
      const email = emp.getElementsByTagName('email')[0]?.textContent || '';

      // Extraer productos del emprendedor
      const productos = emp.getElementsByTagName('productos');
      
      for (let j = 0; j < productos.length; j++) {
        const prod = productos[j];
        
        const product = {
          id_product: prod.getElementsByTagName('idProducts')[0]?.textContent || '',
          title: prod.getElementsByTagName('title')[0]?.textContent || '',
          descriptionProduct: prod.getElementsByTagName('descriptionProduct')[0]?.textContent || '',
          price: parseFloat(prod.getElementsByTagName('price')[0]?.textContent || '0'),
          nameCategory: prod.getElementsByTagName('nameCategory')[0]?.textContent || '',
          nameFile: prod.getElementsByTagName('nameFile')[0]?.textContent || '',
          node: prod.getElementsByTagName('node')[0]?.textContent || '',
          statusProduct: prod.getElementsByTagName('statusProduct')[0]?.textContent || '',
          // Datos del emprendedor
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          nameStore: nameStore.trim(),
          descriptionStore: descriptionStore.trim(),
          location: `${address.trim()}, ${nameCanton.trim()} - ${nameProvincia.trim()}`,
          phone: phone.trim(),
          email: email.trim(),
          year: new Date().getFullYear(),
          featured: false,
          img: this.buildImageUrl(prod.getElementsByTagName('node')[0]?.textContent || '')
        };

        productsList.push(product);
      }
    }

    this.products = productsList;
    this.allProducts = productsList;
    console.log('Productos cargados:', productsList.length);
    console.log('Primer producto:', productsList[0]);
    
    // Extraer categorías únicas
    this.extractCategories();
    
    // Agrupar productos por categoría
    this.groupProductsByCategory();
    
    // Calcular paginación
    this.calculatePagination();
    this.updatePaginatedProducts();
  } catch (error) {
    console.error('Error parseando SOAP XML:', error);
    this.products = [];
  }
}

calculatePagination() {
  this.totalPages = Math.ceil(this.products.length / this.productsPerPage);
  if (this.currentPage > this.totalPages) {
    this.currentPage = 1;
  }
}

updatePaginatedProducts() {
  const startIndex = (this.currentPage - 1) * this.productsPerPage;
  const endIndex = startIndex + this.productsPerPage;
  this.paginatedProducts = this.products.slice(startIndex, endIndex);
  console.log(`📄 Página ${this.currentPage}/${this.totalPages}: Mostrando productos ${startIndex + 1} a ${Math.min(endIndex, this.products.length)}`);
}

goToPage(page: number) {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
    this.updatePaginatedProducts();
    // Scroll suave al inicio de la lista
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.goToPage(this.currentPage + 1);
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.goToPage(this.currentPage - 1);
  }
}

getPageNumbers(): number[] {
  const pages: number[] = [];
  const maxPagesToShow = 5;
  
  if (this.totalPages <= maxPagesToShow) {
    // Mostrar todas las páginas
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Mostrar páginas con ... 
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push(-1); // -1 representa "..."
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < this.totalPages) {
      if (end < this.totalPages - 1) pages.push(-1); // -1 representa "..."
      pages.push(this.totalPages);
    }
  }
  
  return pages;
}

buildImageUrl(fileName: string): string {
  if (!fileName) {
    console.warn('Sin nombre de archivo para imagen');
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23f0f0f0" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="%23999">Sin imagen</text></svg>';
  }
  // Usar proxy para evitar CORS
  const imageUrl = `/images/${fileName}`;
  console.log('URL de imagen a través de proxy:', imageUrl);
  return imageUrl;
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
    console.warn('Error cargando imagen:', img.src);
    img.style.display = 'none';
    // El fallback se mostrará automáticamente porque la imagen está hidden
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.log('Imagen cargada:', img.src);
    // Ocultar el fallback cuando la imagen carga
    const fallback = img.parentElement?.querySelector('.image-fallback') as HTMLElement;
    if (fallback) {
      fallback.style.opacity = '0';
      fallback.style.pointerEvents = 'none';
    }
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/producto', productId]);
  }

  // ====== FILTROS ======
  toggleFilters() {
    this.showFilters = !this.showFilters;
    // Trigger el evento de scroll para actualizar visibilidad del botón de arriba
    this.onWindowScroll();
  }

  extractCategories() {
    const categoriesSet = new Set<string>();
    this.allProducts.forEach(product => {
      if (product.nameCategory) {
        categoriesSet.add(product.nameCategory);
      }
    });
    this.availableCategories = Array.from(categoriesSet).sort();
  }

  toggleCategory(category: string) {
    const index = this.filters.selectedCategories.indexOf(category);
    if (index > -1) {
      this.filters.selectedCategories.splice(index, 1);
    } else {
      this.filters.selectedCategories.push(category);
    }
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allProducts];
    let hasActiveFilters = false;

    // Filtrar por texto (título)
    if (this.filters.searchText.trim()) {
      const searchLower = this.filters.searchText.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchLower)
      );
      hasActiveFilters = true;
    }

    // Filtrar por precio mínimo
    if (this.filters.minPrice !== null && this.filters.minPrice > 0) {
      filtered = filtered.filter(p => p.price >= this.filters.minPrice!);
      hasActiveFilters = true;
    }

    // Filtrar por precio máximo
    if (this.filters.maxPrice !== null && this.filters.maxPrice > 0) {
      filtered = filtered.filter(p => p.price <= this.filters.maxPrice!);
      hasActiveFilters = true;
    }

    // Filtrar por categorías
    if (this.filters.selectedCategories.length > 0) {
      filtered = filtered.filter(p => 
        this.filters.selectedCategories.includes(p.nameCategory)
      );
      hasActiveFilters = true;
    }

    this.products = filtered;
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedProducts();

    // Cambiar a vista grid si hay filtros activos
    if (hasActiveFilters && this.currentView === 'home') {
      this.currentView = 'grid';
    }
  }

  clearFilters() {
    this.filters = {
      searchText: '',
      minPrice: null,
      maxPrice: null,
      selectedCategories: []
    };
    this.products = [...this.allProducts];
    this.calculatePagination();
    this.updatePaginatedProducts();
    
    // Volver a home si estábamos en grid por filtros
    if (this.currentView === 'grid' && !this.selectedCategoryView) {
      this.currentView = 'home';
    }
  }

  // ====== VISTAS Y CATEGORÍAS ======
  groupProductsByCategory() {
    const grouped = new Map<string, any[]>();
    
    // Agrupar productos por categoría
    this.allProducts.forEach(product => {
      const category = product.nameCategory || 'Sin categoría';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(product);
    });

    // Ordenar por prioridad
    this.categoryGroups = [];
    
    // Primero agregar categorías en orden de prioridad
    this.categoryPriority.forEach(category => {
      if (grouped.has(category)) {
        this.categoryGroups.push({
          category,
          products: grouped.get(category)!
        });
        grouped.delete(category);
      }
    });

    // Agregar categorías restantes
    grouped.forEach((products, category) => {
      this.categoryGroups.push({ category, products });
    });

    console.log('📊 Categorías agrupadas:', this.categoryGroups.length);
  }

  viewAllCategory(category: string) {
    this.currentView = 'grid';
    this.selectedCategoryView = category;
    this.filters.selectedCategories = [category];
    this.applyFilters();
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToHome() {
    this.currentView = 'home';
    this.selectedCategoryView = null;
    this.clearFilters();
  }

  scrollCategoryLeft(categoryIndex: number) {
    const container = document.querySelector(`.category-scroll-${categoryIndex}`) as HTMLElement;
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollCategoryRight(categoryIndex: number) {
    const container = document.querySelector(`.category-scroll-${categoryIndex}`) as HTMLElement;
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }

  // Categorías principales para navegación rápida
  mainCategories: any[] = [
    { id_category: 33, name_category: 'Alimentos y Bebidas', icon: 'fa-utensils' },
    { id_category: 32, name_category: 'Hoteles y Alojamientos', icon: 'fa-hotel' },
    { id_category: 14, name_category: 'Comercio', icon: 'fa-shopping-bag' },
    { id_category: 2, name_category: 'Agropecuaria', icon: 'fa-seedling' },
    { id_category: 5, name_category: 'Manufactura', icon: 'fa-industry' },
    { id_category: 37, name_category: 'Otras Actividades de Servicio', icon: 'fa-briefcase' }
  ];

  // TrackBy functions para optimización de ngFor
  trackByProductId(index: number, item: any): any {
    return item.id_product || index;
  }

  trackByCategoryIndex(index: number, item: any): any {
    return item.category || index;
  }

  trackByPageNumber(index: number, item: number): number {
    return item;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  trackByProvinceId(index: number, item: Province): number {
    return item.id;
  }

  // Obtener icono según la categoría
  getCategoryIcon(categoryId: number): string {
    const category = this.mainCategories.find(c => c.id_category === categoryId);
    return category ? category.icon : 'fa-tag';
  }

  // Navegar a una categoría y hacer scroll
  scrollToCategory(categoryName: string): void {
    // Buscar el índice del grupo de categoría por nombre
    const groupIndex = this.categoryGroups.findIndex(
      group => group.category === categoryName
    );
    
    if (groupIndex !== -1) {
      // Hacer scroll hacia el elemento usando el índice
      setTimeout(() => {
        const sections = document.querySelectorAll('.category-section');
        if (sections[groupIndex]) {
          const headerOffset = 100; // Offset para el header fijo
          const elementPosition = sections[groupIndex].getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  }

  // Toggle dropdown de provincias
  toggleProvinceDropdown(): void {
    this.showProvinceDropdown = !this.showProvinceDropdown;
  }

  // Seleccionar provincia
  selectProvince(province: Province): void {
    this.selectedProvince = province.name;
    this.selectedProvinceName = `${province.name} - Ecuador`;
    this.showProvinceDropdown = false;
    
    // Filtrar productos por provincia
    this.filterProductsByProvince(province.name);
  }

  // Filtrar productos por provincia
  filterProductsByProvince(provinceName: string): void {
    if (provinceName) {
      this.products = this.allProducts.filter(product => 
        product.location?.toLowerCase().includes(provinceName.toLowerCase())
      );
    } else {
      this.products = [...this.allProducts];
    }
    
    // Reagrupar por categorías
    this.groupProductsByCategory();
    this.calculatePagination();
    this.updatePaginatedProducts();
    this.cdr.detectChanges();
  }

  // Limpiar filtro de provincia (ver todos)
  clearProvinceFilter(): void {
    this.selectedProvince = null;
    this.selectedProvinceName = 'Ecuador';
    this.showProvinceDropdown = false;
    this.products = [...this.allProducts];
    this.groupProductsByCategory();
    this.calculatePagination();
    this.updatePaginatedProducts();
    this.cdr.detectChanges();
  }

  // Cerrar dropdown al hacer click fuera
  closeDropdownOnClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.location-selector')) {
      this.showProvinceDropdown = false;
    }
  }

  ngAfterViewInit(): void {
    window.addEventListener('scroll', this.onWindowScroll, true);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onWindowScroll, true);
  }

  onWindowScroll = () => {
    // Mostrar botón de arriba solo si NO está abierto el panel de filtros
    // y si el scroll es mayor a 300px
    this.showScrollTop = window.scrollY > 300 && !this.showFilters;
    this.cdr.detectChanges();
  };

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
