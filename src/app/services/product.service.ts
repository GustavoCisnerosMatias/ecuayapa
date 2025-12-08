import { Injectable } from '@angular/core';
import { LocationService, Province } from './location.service';

export interface Product {
  id: number;
  title: string;
  year: number;
  price: number;
  location: string;
  mileage: number;
  featured: boolean;
  image: string;
  province?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private provinceLocationMap: { [key: string]: string[] } = {
    pichincha: ['Quito', 'Centro-Norte'],
    guayas: ['Guayaquil', 'Costa'],
    azuay: ['Cuenca', 'Sur'],
    tungurahua: ['Ambato', 'Sierra'],
    manabi: ['Manta', 'Costa'],
    'santa-elena': ['Santa Elena', 'Costa'],
    'el-oro': ['Machala', 'Costa'],
    loja: ['Loja', 'Sur'],
    chimborazo: ['Riobamba', 'Sierra'],
    imbabura: ['Ibarra', 'Sierra'],
    carchi: ['Tulcán', 'Sierra'],
    sucumbios: ['Nueva Loja', 'Oriente'],
    napo: ['Tena', 'Oriente'],
    pastaza: ['Puyo', 'Oriente'],
    'morona-santiago': ['Macas', 'Oriente'],
    'zamora-chinchipe': ['Zamora', 'Oriente'],
    orellana: ['Francisco de Orellana', 'Oriente'],
    galápagos: ['Puerto Ayora', 'Insular'],
  };

  constructor(private locationService: LocationService) {}

  filterProductsByProvince(products: Product[], provinceId?: string): Product[] {
    if (!provinceId) {
      return products;
    }

    const locations = this.provinceLocationMap[provinceId] || [];
    return products.filter((product) => locations.some((loc) => product.location.includes(loc)));
  }

  getProductsBySelectedProvince(products: Product[]): Product[] {
    const selectedProvince = this.locationService.getSelectedProvince();
    if (!selectedProvince) {
      return products;
    }
    return this.filterProductsByProvince(products, selectedProvince.id);
  }

  highlightProductsByProvince(products: Product[], provinceId?: string): Product[] {
    if (!provinceId) {
      return products;
    }

    const locations = this.provinceLocationMap[provinceId] || [];
    return products.map((product) => ({
      ...product,
      featured: locations.some((loc) => product.location.includes(loc)) || product.featured,
    }));
  }
}
