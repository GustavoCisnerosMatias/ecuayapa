import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Province {
  id: string;
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

  provinces: Province[] = [
    {
      id: 'pichincha',
      name: 'Pichincha',
      lat: -0.2193,
      lng: -78.5125,
      icon: 'mountain',
      region: 'Sierra',
    },
    {
      id: 'guayas',
      name: 'Guayas',
      lat: -2.1692,
      lng: -79.9218,
      icon: 'water',
      region: 'Costa',
    },
    {
      id: 'azuay',
      name: 'Azuay',
      lat: -2.9036,
      lng: -79.0087,
      icon: 'landmark',
      region: 'Sierra',
    },
    {
      id: 'tungurahua',
      name: 'Tungurahua',
      lat: -1.2343,
      lng: -78.6344,
      icon: 'leaf',
      region: 'Sierra',
    },
    {
      id: 'manabi',
      name: 'Manabí',
      lat: -0.95,
      lng: -80.73,
      icon: 'sun',
      region: 'Costa',
    },
    {
      id: 'santa-elena',
      name: 'Santa Elena',
      lat: -2.21,
      lng: -80.38,
      icon: 'turtle', // icono representativo de fauna marina
      region: 'Costa',
    },
    {
      id: 'el-oro',
      name: 'El Oro',
      lat: -3.29,
      lng: -79.97,
      icon: 'gem',
      region: 'Costa',
    },
    {
      id: 'loja',
      name: 'Loja',
      lat: -4.0,
      lng: -79.2,
      icon: 'tree',
      region: 'Sierra',
    },
    {
      id: 'chimborazo',
      name: 'Chimborazo',
      lat: -1.67,
      lng: -78.65,
      icon: 'snowflake',
      region: 'Sierra',
    },
    {
      id: 'imbabura',
      name: 'Imbabura',
      lat: 0.35,
      lng: -78.12,
      icon: 'lake',
      region: 'Sierra',
    },
    {
      id: 'carchi',
      name: 'Carchi',
      lat: 0.82,
      lng: -77.27,
      icon: 'flag',
      region: 'Sierra',
    },
    {
      id: 'sucumbios',
      name: 'Sucumbíos',
      lat: 0.09,
      lng: -76.9,
      icon: 'leaf',
      region: 'Oriente',
    },
    {
      id: 'napo',
      name: 'Napo',
      lat: -0.5,
      lng: -77.49,
      icon: 'tree',
      region: 'Oriente',
    },
    {
      id: 'pastaza',
      name: 'Pastaza',
      lat: -1.54,
      lng: -77.66,
      icon: 'leaf',
      region: 'Oriente',
    },
    {
      id: 'morona-santiago',
      name: 'Morona Santiago',
      lat: -3.0,
      lng: -78.2,
      icon: 'leaf',
      region: 'Oriente',
    },
    {
      id: 'zamora-chinchipe',
      name: 'Zamora Chinchipe',
      lat: -4.04,
      lng: -78.74,
      icon: 'leaf',
      region: 'Oriente',
    },
    {
      id: 'orellana',
      name: 'Orellana',
      lat: -0.46,
      lng: -76.98,
      icon: 'leaf',
      region: 'Oriente',
    },
    {
      id: 'galapagos',
      name: 'Galápagos',
      lat: -0.97,
      lng: -90.73,
      icon: 'tortoise', // tortuga gigante como icono representativo
      region: 'Insular',
    },
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
}
