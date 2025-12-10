import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Province {
  id: number;
  name: string;
  lat: number;
  lng: number;
  icon: string;
  region: string;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private selectedProvinceSubject = new BehaviorSubject<Province | null>(null);
  public selectedProvince$ = this.selectedProvinceSubject.asObservable();

  private showLocationModalSubject = new BehaviorSubject<boolean>(false);
  public showLocationModal$ = this.showLocationModalSubject.asObservable();

  provinces: Province[] = 
[
  // --- COSTA ---
  {
    id: 7,
    name: 'El Oro',
    lat: -3.29,
    lng: -79.97,
    icon: 'gem',
    region: 'Costa',
  },
  {
    id: 8,
    name: 'Esmeraldas',
    lat: 0.96,
    lng: -79.66,
    icon: 'palm',
    region: 'Costa',
  },
  {
    id: 9,
    name: 'Guayas',
    lat: -2.17,
    lng: -79.92,
    icon: 'water',
    region: 'Costa',
  },
  {
    id: 12,
    name: 'Los Ríos',
    lat: -1.80,
    lng: -79.53,
    icon: 'river',
    region: 'Costa',
  },
  {
    id: 13,
    name: 'Manabí',
    lat: -0.95,
    lng: -80.73,
    icon: 'sun',
    region: 'Costa',
  },
  {
    id: 23,
    name: 'Santo Domingo de los Tsáchilas',
    lat: -0.25,
    lng: -79.17,
    icon: 'tribal',
    region: 'Costa',
  },
  {
    id: 24,
    name: 'Santa Elena',
    lat: -2.21,
    lng: -80.38,
    icon: 'turtle',
    region: 'Costa',
  },

  // --- SIERRA ---
  {
    id: 1,
    name: 'Azuay',
    lat: -2.90,
    lng: -79.00,
    icon: 'landmark',
    region: 'Sierra',
  },
  {
    id: 2,
    name: 'Bolívar',
    lat: -1.61,
    lng: -79.04,
    icon: 'mountain',
    region: 'Sierra',
  },
  {
    id: 3,
    name: 'Cañar',
    lat: -2.55,
    lng: -78.94,
    icon: 'temple',
    region: 'Sierra',
  },
  {
    id: 4,
    name: 'Carchi',
    lat: 0.82,
    lng: -77.27,
    icon: 'flag',
    region: 'Sierra',
  },
  {
    id: 5,
    name: 'Cotopaxi',
    lat: -0.93,
    lng: -78.61,
    icon: 'volcano',
    region: 'Sierra',
  },
  {
    id: 6,
    name: 'Chimborazo',
    lat: -1.67,
    lng: -78.65,
    icon: 'snowflake',
    region: 'Sierra',
  },
  {
    id: 10,
    name: 'Imbabura',
    lat: 0.35,
    lng: -78.12,
    icon: 'lake',
    region: 'Sierra',
  },
  {
    id: 11,
    name: 'Loja',
    lat: -4.00,
    lng: -79.20,
    icon: 'tree',
    region: 'Sierra',
  },
  {
    id: 17,
    name: 'Pichincha',
    lat: -0.2193,
    lng: -78.5125,
    icon: 'mountain',
    region: 'Sierra',
  },
  {
    id: 18,
    name: 'Tungurahua',
    lat: -1.24,
    lng: -78.63,
    icon: 'leaf',
    region: 'Sierra',
  },

  // --- ORIENTE ---
  {
    id: 14,
    name: 'Morona Santiago',
    lat: -3.00,
    lng: -78.20,
    icon: 'leaf',
    region: 'Oriente',
  },
  {
    id: 15,
    name: 'Napo',
    lat: -0.50,
    lng: -77.49,
    icon: 'tree',
    region: 'Oriente',
  },
  {
    id: 16,
    name: 'Pastaza',
    lat: -1.54,
    lng: -77.66,
    icon: 'leaf',
    region: 'Oriente',
  },
  {
    id: 19,
    name: 'Zamora Chinchipe',
    lat: -4.04,
    lng: -78.74,
    icon: 'leaf',
    region: 'Oriente',
  },
  {
    id: 21,
    name: 'Sucumbíos',
    lat: 0.09,
    lng: -76.90,
    icon: 'leaf',
    region: 'Oriente',
  },
  {
    id: 22,
    name: 'Orellana',
    lat: -0.46,
    lng: -76.98,
    icon: 'leaf',
    region: 'Oriente',
  },

  // --- INSULAR ---
  {
    id: 20,
    name: 'Galápagos',
    lat: -0.97,
    lng: -90.73,
    icon: 'tortoise',
    region: 'Insular',
  }
];

  



  constructor() {}

  openLocationModal() {
    this.showLocationModalSubject.next(true);
  }

  closeLocationModal() {
    this.showLocationModalSubject.next(false);
  }

  selectProvince(province: Province) {
    this.selectedProvinceSubject.next(province);
    this.closeLocationModal();
  }

  getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error('Geolocalización no disponible'));
      }
    });
  }

  getNearestProvince(latitude: number, longitude: number): Province {
    let nearest = this.provinces[0];
    let minDistance = Infinity;

    this.provinces.forEach((province) => {
      const distance = Math.sqrt(
        Math.pow(province.lat - latitude, 2) + Math.pow(province.lng - longitude, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = province;
      }
    });

    return nearest;
  }

  getSelectedProvince(): Province | null {
    return this.selectedProvinceSubject.value;
  }

  getProvinceByRegion(region: string): Province[] {
    return this.provinces.filter((p) => p.region === region);
  }

  private readonly STORAGE_KEY = 'selectedProvince';

/** Guarda la provincia seleccionada en localStorage */
saveProvinceToStorage(province: Province) {
  localStorage.setItem(this.STORAGE_KEY, JSON.stringify(province));
}

/** Carga la provincia guardada y actualiza el BehaviorSubject */
loadProvinceFromStorage() {
  const stored = localStorage.getItem(this.STORAGE_KEY);
  if (stored) {
    this.selectedProvinceSubject.next(JSON.parse(stored));
  }
}

/** Actualiza la provincia guardada en localStorage */
updateProvinceInStorage(updatedProvince: Province) {
  localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedProvince));
  this.selectedProvinceSubject.next(updatedProvince);
}

/** Elimina la provincia guardada */
clearProvinceFromStorage() {
  localStorage.removeItem(this.STORAGE_KEY);
  this.selectedProvinceSubject.next(null);
}

/** Obtiene la provincia directamente desde localStorage */
getProvinceFromStorage(): Province | null {
  const stored = localStorage.getItem(this.STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

}
