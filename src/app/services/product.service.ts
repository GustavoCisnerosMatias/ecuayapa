import { Injectable } from '@angular/core';
import { LocationService, Province } from './location.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

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

  constructor(private locationService: LocationService, private http: HttpClient) {}

  filterProductsByProvince(products: Product[], provinceId?: number): Product[] {
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



  private baseUrl = 'http://localhost:8000/api/products.php';



  // Traer productos por provincia
  getProductsByProvince1(id_province: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}?id_province=${id_province}`);
  }

  getProductsByProvince3(id_province: number): Observable<any> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ecu="http://impl.service.siimies.web.ecuayapa/">
        <soapenv:Header/>
        <soapenv:Body>
          <ecu:consultarEmprendedoresConProductosPaginado/>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const headers = new HttpHeaders({
      'Content-Type': 'text/xml',
      // 'Authorization': 'Basic ' + btoa('usuario:password') // si necesitas auth
    });

    // Ruta del endpoint SOAP
    return this.http.post('http://localhost:8080/ecuayapa-ws/ecuayapa-service', soapBody, { headers, responseType: 'text' });
  }


  getProductsByProvince(id_province: number): Observable<any> {
  const soapBody = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ecu="http://impl.service.siimies.web.ecuayapa/">
      <soapenv:Header/>
      <soapenv:Body>
        <ecu:consultarEmprendedoresConProductosPaginado/>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  const headers = new HttpHeaders({
    'Content-Type': 'text/xml',
    // 'Authorization': 'Basic ' + btoa('usuario:password') // si tu servicio requiere autenticación
  });

  return this.http.post('http://localhost:8080/ecuayapa-ws/ecuayapa-service', soapBody, { headers, responseType: 'text' });
}



getEmprendedoresConProductosPaginado(): Observable<string> {
  const soapBody = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ecu="http://impl.service.siimies.web.ecuayapa/">
      <soapenv:Header/>
      <soapenv:Body>
        <ecu:consultarEmprendedoresConProductosPaginado/>
      </soapenv:Body>
    </soapenv:Envelope>
  `;
  const headers = new HttpHeaders({ 'Content-Type': 'text/xml' });
  return this.http.post('http://localhost:8080/ecuayapa-ws/ecuayapa-service', soapBody, { headers, responseType: 'text' });
}

    // Traer un producto por su ID
  getProductById(id_product: string): Observable<{ data: Product }> {
    return this.http.get<{ data: Product }>(`${this.baseUrl}?id_product=${id_product}`);
  }

  // getProductByIdSOAP(id_product: string): Observable<string> {
  //   console.log("Llamando a getProductByIdSOAP con id_product:", id_product);
  //   const url = 'https://siimdhalpha.desarrollohumano.gob.ec/ecuayapa-ws/ecuayapa-service';

  //   const soapEnvelope = `
  //     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  //                       xmlns:ecu="http://ecuayapa.mdh.gob.ec/">
  //       <soapenv:Header/>
  //       <soapenv:Body>
  //         <ecu:tuMetodo>
  //           <username>ws.mdh.ecuayapa</username>
  //           <password>Ecu4Y@paSii</password>
  //           <idProducto>${id_product}</idProducto>
  //         </ecu:tuMetodo>
  //       </soapenv:Body>
  //     </soapenv:Envelope>
  //   `;

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'text/xml;charset=UTF-8',
  //     'SOAPAction': ''
  //   });

  //   return this.http.post(url, soapEnvelope, {
  //     headers,
  //     responseType: 'text'
  //   }).pipe(
  //     tap(resp => console.log('Respuesta SOAP:', resp))
  //   );
  // }
getProductByIdSOAP(): Observable<string> {
  // Usa /api en desarrollo (proxy redirige a prod)
  const url = '/api/ecuayapa-ws/ecuayapa-service';

  const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:ecu="http://impl.service.siimies.web.ecuayapa/">
      <soapenv:Header/>
      <soapenv:Body>
        <ecu:consultarEmprendedoresConProductosPaginado/>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  const headers = new HttpHeaders({
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': '',
    'Authorization': 'Basic ' + btoa('ws.mdh.ecuayapa:Ecu4Y@paSii')
  });

  return this.http.post(url, soapEnvelope, {
    headers,
    responseType: 'text'
  }).pipe(
    tap(resp => console.log("✅ SOAP RESPONSE:", resp)),
    catchError(error => {
      console.error("❌ Error en SOAP:", error);
      return throwError(() => ({
        message: "Error conectando con Ecuayapa",
        original: error
      }));
    })
  );
}

getProductDetail(productId: string | number): Observable<any> {
  // Usa /api en desarrollo (proxy redirige a prod)
  const url = '/api/ecuayapa-ws/ecuayapa-service';

  const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:ecu="http://impl.service.siimies.web.ecuayapa/">
      <soapenv:Header/>
      <soapenv:Body>
        <ecu:consultarEmprendedoresConProductosPaginado/>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  const headers = new HttpHeaders({
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': '',
    'Authorization': 'Basic ' + btoa('ws.mdh.ecuayapa:Ecu4Y@paSii')
  });

  return this.http.post(url, soapEnvelope, {
    headers,
    responseType: 'text'
  }).pipe(
    tap(resp => console.log("✅ SOAP Response received, will search for product ID:", productId)),
    catchError(error => {
      console.error("❌ Error en SOAP:", error);
      return throwError(() => ({
        message: "Error conectando con Ecuayapa",
        original: error
      }));
    })
  );
}

  }