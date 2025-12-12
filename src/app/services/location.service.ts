import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

export interface Province {
  id: number;
  name: string;
  lat?: number;
  lng?: number;
  icon?: string;
  region?: string;
}

export interface Canton {
  id: number;
  name: string;
  provinceId: number;
}

export interface Parish {
  id: number;
  name: string;
  cantonId: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private selectedProvinceSubject = new BehaviorSubject<Province | null>(null);
  public selectedProvince$ = this.selectedProvinceSubject.asObservable();

  private showLocationModalSubject = new BehaviorSubject<boolean>(false);
  public showLocationModal$ = this.showLocationModalSubject.asObservable();

  private readonly SOAP_URL = '/ferias-ws/ferias-service';
  private readonly SOAP_USER = 'ws.mdh.ecuayapa';
  private readonly SOAP_PASS = 'Ecu4Y@paSii';

  provinces: Province[] = [];
  private cantons: Canton[] = [];
  private parishes: Parish[] = [];

  constructor(private http: HttpClient) {
    this.loadProvincesFromSOAP();
  }

  /** Carga provincias dinámicamente desde SOAP */
  loadProvincesFromSOAP(): Observable<Province[]> {

    
    const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://impl.service.siimies.web.ferias/">
        <soap:Body>
          <tns:cargarProvincias/>
        </soap:Body>
      </soap:Envelope>`;

    console.log('📤 Enviando request SOAP...');
    
    return this.http.post(this.SOAP_URL, soapRequest, {
      headers: { 
        'Content-Type': 'text/xml',
        'Authorization': 'Basic ' + btoa(this.SOAP_USER + ':' + this.SOAP_PASS)
      },
      responseType: 'text'
    }).pipe(
      map((response: string) => {
        console.log('📦 Contenido SOAP (primeros 500 caracteres):', response.substring(0, 500));
        const provincias = this.parseProvincias(response);
        this.provinces = provincias.sort((a, b) => a.name.localeCompare(b.name, 'es-EC'));
        console.log('✅ Provincias cargadas y ordenadas:', this.provinces);
        return this.provinces;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ ERROR SOAP en cargarProvincias:', error);
        console.error('Status:', error.status);
        console.error('StatusText:', error.statusText);
        console.error('Message:', error.message);
        console.error('Error:', error.error);
        return throwError(() => error);
      })
    );
  }

  /** Parsea la respuesta SOAP de provincias */
  private parseProvincias(soapResponse: string): Province[] {
    console.log('🔍 Iniciando parsing de provincias...');
    console.log('📋 Respuesta completa:', soapResponse);
    
    try {
      // Verificar si hay errores de parseo XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(soapResponse, 'text/xml');
      
      // Detectar errores de parsing
      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        console.error('❌ Error de parseo XML detectado');
        console.error('Contenido error:', xmlDoc.documentElement);
        return [];
      }

      // Intentar con diferentes etiquetas
      let provinceElements = xmlDoc.getElementsByTagName('return');
      console.log(`📊 Intentando tag 'return': encontrados ${provinceElements.length}`);
      
      if (provinceElements.length === 0) {
        provinceElements = xmlDoc.getElementsByTagName('provincia');
        console.log(`📊 Intentando tag 'provincia': encontrados ${provinceElements.length}`);
      }
      
      if (provinceElements.length === 0) {
        provinceElements = xmlDoc.getElementsByTagName('ns2:return');
        console.log(`📊 Intentando tag 'ns2:return': encontrados ${provinceElements.length}`);
      }
      
      if (provinceElements.length === 0) {
        // Log de todos los elementos
        const allElements = xmlDoc.getElementsByTagName('*');
        console.log(`📊 Total de elementos en XML: ${allElements.length}`);
        console.log('🔍 Tipos de elementos encontrados:');
        const tagNames = new Set<string>();
        for (let i = 0; i < Math.min(allElements.length, 100); i++) {
          tagNames.add(allElements[i].tagName);
          if (i < 20) {
            console.log(`  [${i}] ${allElements[i].tagName}`);
          }
        }
        console.log('Todas las etiquetas únicas:', Array.from(tagNames).join(', '));
      }
      
      const provincias: Province[] = [];
      
      console.log(`🔄 Procesando ${provinceElements.length} elementos...`);
      
      // El XML usa geografiaCdhActualEntityList con codigoProvincia y provincia
      const geoElements = xmlDoc.getElementsByTagName('geografiaCdhActualEntityList');
      console.log(`📍 Encontrados ${geoElements.length} elementos geografiaCdhActualEntityList`);
      
      for (let i = 0; i < geoElements.length; i++) {
        const element = geoElements[i];
        const codigoElem = element.getElementsByTagName('codigoProvincia')[0];
        const provinciaElem = element.getElementsByTagName('provincia')[0];
        
        const codigo = codigoElem?.textContent?.trim() || '';
        const nombre = provinciaElem?.textContent?.trim() || '';
        
        
        if (codigo && nombre) {
          const id = parseInt(codigo);
          provincias.push({ id, name: nombre });
        }
      }
      
      console.log(`✓ Total de provincias parseadas: ${provincias.length}`);
      return provincias;
    } catch (error) {
      console.error('❌ Error en parseProvincias:', error);
      console.error('Stack:', (error as Error).stack);
      return [];
    }
  }

  /** Carga cantones por ID de provincia desde SOAP */
  loadCantonsByProvince(provinceId: number): Observable<Canton[]> {
    console.log(`🔄 Cargando cantones para provincia ID: ${provinceId}...`);
    
    const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://impl.service.siimies.web.ferias/">
        <soap:Body>
          <tns:cargarCanton>
            <arg0>${provinceId}</arg0>
          </tns:cargarCanton>
        </soap:Body>
      </soap:Envelope>`;

    return this.http.post(this.SOAP_URL, soapRequest, {
      headers: { 
        'Content-Type': 'text/xml',
        'Authorization': 'Basic ' + btoa(this.SOAP_USER + ':' + this.SOAP_PASS)
      },
      responseType: 'text'
    }).pipe(
      map((response: string) => {
        console.log(`✅ Respuesta SOAP para cantones recibida - Longitud: ${response.length}`);
        const cantones = this.parseCantones(response, provinceId);
        console.log(`✓ Cantones cargados para provincia ${provinceId}:`, cantones);
        return cantones.sort((a, b) => a.name.localeCompare(b.name, 'es-EC'));
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`❌ ERROR SOAP en cargarCanton (provincia ${provinceId}):`, error);
        console.error('Status:', error.status);
        console.error('StatusText:', error.statusText);
        console.error('Message:', error.message);
        return throwError(() => error);
      })
    );
  }

  /** Parsea la respuesta SOAP de cantones */
  private parseCantones(soapResponse: string, provinceId: number): Canton[] {
    console.log(`🔍 Parseando cantones para provincia ${provinceId}...`);
    
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(soapResponse, 'text/xml');
      
      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        console.error('❌ Error de parseo XML en cantones');
        return [];
      }
      
      const geoElements = xmlDoc.getElementsByTagName('geografiaCdhActualEntityList');
      console.log(`📊 Cantones encontrados: ${geoElements.length}`);
      
      const cantones: Canton[] = [];
      
      for (let i = 0; i < geoElements.length; i++) {
        const element = geoElements[i];
        const codigoElem = element.getElementsByTagName('codigoCanton')[0];
        const cantonElem = element.getElementsByTagName('canton')[0];
        
        const codigo = codigoElem?.textContent?.trim() || '';
        const nombre = cantonElem?.textContent?.trim() || '';
        
        if (codigo && nombre) {
          const id = parseInt(codigo);
          cantones.push({ id, name: nombre, provinceId });
          console.log(`  ├─ Cantón ${id}: ${nombre}`);
        }
      }
      
      console.log(`✓ Total cantones parseados: ${cantones.length}`);
      return cantones;
    } catch (error) {
      console.error('❌ Error parseando cantones:', error);
      return [];
    }
  }

  /** Carga parroquias por ID de cantón desde SOAP */
  loadParishesByCanton(cantonId: number): Observable<Parish[]> {
    console.log(`🔄 Cargando parroquias para cantón ID: ${cantonId}...`);
    
    const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://impl.service.siimies.web.ferias/">
        <soap:Body>
          <tns:cargarParroquia>
            <arg0>${cantonId}</arg0>
          </tns:cargarParroquia>
        </soap:Body>
      </soap:Envelope>`;

    return this.http.post(this.SOAP_URL, soapRequest, {
      headers: { 
        'Content-Type': 'text/xml',
        'Authorization': 'Basic ' + btoa(this.SOAP_USER + ':' + this.SOAP_PASS)
      },
      responseType: 'text'
    }).pipe(
      map((response: string) => {
        console.log(`✅ Respuesta SOAP para parroquias recibida - Longitud: ${response.length}`);
        const parroquias = this.parseParroquias(response, cantonId);
        console.log(`✓ Parroquias cargadas para cantón ${cantonId}:`, parroquias);
        return parroquias.sort((a, b) => a.name.localeCompare(b.name, 'es-EC'));
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`❌ ERROR SOAP en cargarParroquia (cantón ${cantonId}):`, error);
        console.error('Status:', error.status);
        console.error('StatusText:', error.statusText);
        console.error('Message:', error.message);
        return throwError(() => error);
      })
    );
  }

  /** Parsea la respuesta SOAP de parroquias */
  private parseParroquias(soapResponse: string, cantonId: number): Parish[] {
    console.log(`🔍 Parseando parroquias para cantón ${cantonId}...`);
    
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(soapResponse, 'text/xml');
      
      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        console.error('❌ Error de parseo XML en parroquias');
        return [];
      }
      
      const geoElements = xmlDoc.getElementsByTagName('geografiaCdhActualEntityList');
      console.log(`📊 Parroquias encontradas: ${geoElements.length}`);
      
      const parroquias: Parish[] = [];
      
      for (let i = 0; i < geoElements.length; i++) {
        const element = geoElements[i];
        const codigoElem = element.getElementsByTagName('codigoParroquia')[0];
        const parroquiaElem = element.getElementsByTagName('parroquia')[0];
        
        const codigo = codigoElem?.textContent?.trim() || '';
        const nombre = parroquiaElem?.textContent?.trim() || '';
        
        if (codigo && nombre) {
          const id = parseInt(codigo);
          parroquias.push({ id, name: nombre, cantonId });
          console.log(`  ├─ Parroquia ${id}: ${nombre}`);
        }
      }
      
      console.log(`✓ Total parroquias parseadas: ${parroquias.length}`);
      return parroquias;
    } catch (error) {
      console.error('❌ Error parseando parroquias:', error);
      return [];
    }
  }

  // Mantener datos hardcodeados como fallback
  private provincesBackup: Province[] = 
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
    lat: 0.77335,
    lng: -78.04688,
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

  getProvinces(): Province[] {
    return this.provinces;
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
      if (province.lat !== undefined && province.lng !== undefined) {
        const distance = Math.sqrt(
          Math.pow(province.lat - latitude, 2) + Math.pow(province.lng - longitude, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = province;
        }
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

/** M\u00e9todos legacy mantenidos para compatibilidad */
getCantonsByProvince(provinceName: string): Canton[] {
  const province = this.provinces.find(p => p.name === provinceName);
  if (!province) return [];
  return this.cantons.filter(c => c.provinceId === province.id);
}

getParishesByCanton(cantonName: string): Parish[] {
  const canton = this.cantons.find(c => c.name === cantonName);
  if (!canton) return [];
  return this.parishes.filter(p => p.cantonId === canton.id);
}

}
