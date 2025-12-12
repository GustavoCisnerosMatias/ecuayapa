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
    private readonly API_URL = '/api/ecuayapa-ws/ecuayapa-service';
  private readonly NAMESPACE = 'http://impl.service.siimies.web.ecuayapa/';

  private readonly SOAP_USER = 'ws.mdh.ecuayapa';
  private readonly SOAP_PASS = 'Ecu4Y@paSii';
  private readonly defaultHeaders = new HttpHeaders({
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': '',
    'Authorization': 'Basic ' + btoa(this.SOAP_USER + ':' + this.SOAP_PASS)
  });
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
    tap(resp => console.log("✅ SOAP RESPONSE:")),
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
/**
   * 1. CONSULTAR EMPRENDEDORES CON PRODUCTOS PAGINADO
   * Sin parámetros
   * Retorna: lista de emprendedores con sus productos
   */
  consultarEmprendedoresConProductosPaginado(): Observable<string> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ecu="${this.NAMESPACE}">
        <soapenv:Header/>
        <soapenv:Body>
          <ecu:consultarEmprendedoresConProductosPaginado/>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    return this.http.post(this.API_URL, soapBody, { headers: this.defaultHeaders, responseType: 'text' }).pipe(
      tap(resp => console.log('✅ consultarEmprendedoresConProductosPaginado:', resp)),
      catchError(error => this.handleError('consultarEmprendedoresConProductosPaginado', error))
    );
  }

  /**
   * 2. CONSULTAR REGISTROS ECUAYAPA
   * Parámetro: ci (String) - cédula del usuario
   * Retorna: datos del registro asociado a la cédula
   */
  consultarRegistrosEcuayapa(ci: string): Observable<string> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ecu="${this.NAMESPACE}">
        <soapenv:Header/>
        <soapenv:Body>
          <ecu:consultarRegistrosEcuayapa>
            <ci>${this.escapeXml(ci)}</ci>
          </ecu:consultarRegistrosEcuayapa>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    return this.http.post(this.API_URL, soapBody, { headers: this.defaultHeaders, responseType: 'text' }).pipe(
      tap(resp => console.log('✅ consultarRegistrosEcuayapa:', resp)),
      catchError(error => this.handleError('consultarRegistrosEcuayapa', error))
    );
  }

  /**
   * 3. CONSULTAR CATEGORÍAS POR ID PARENT
   * Parámetro: idParent (Integer) - ID de la categoría padre
   * Retorna: lista de subcategorías
   */
  consultarCategoriasPorIdParent(idParent: number): Observable<string> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ecu="${this.NAMESPACE}">
        <soapenv:Header/>
        <soapenv:Body>
          <ecu:consultarCategoriasPorIdParent>
            <idParent>${idParent}</idParent>
          </ecu:consultarCategoriasPorIdParent>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    return this.http.post(this.API_URL, soapBody, { headers: this.defaultHeaders, responseType: 'text' }).pipe(
      tap(resp => console.log('✅ consultarCategoriasPorIdParent:', resp)),
      catchError(error => this.handleError('consultarCategoriasPorIdParent', error))
    );
  }

  /**
   * 4. REGISTRAR CLICK PRODUCTO
   * Parámetro: productId (Integer) - ID del producto
   * Retorna: confirmación del registro del click
   */
  registrarClickProducto(productId: number): Observable<string> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ecu="${this.NAMESPACE}">
        <soapenv:Header/>
        <soapenv:Body>
          <ecu:registrarClickProducto>
            <productId>${productId}</productId>
          </ecu:registrarClickProducto>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    return this.http.post(this.API_URL, soapBody, { headers: this.defaultHeaders, responseType: 'text' }).pipe(
      tap(resp => console.log('✅ registrarClickProducto:', resp)),
      catchError(error => this.handleError('registrarClickProducto', error))
    );
  }

  /**
   * 5. REGISTRAR CLICK SELL PRODUCTO
   * Parámetro: productId (Integer) - ID del producto
   * Retorna: confirmación del registro del click de venta
   */
  registrarClickSellProducto(productId: number): Observable<string> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ecu="${this.NAMESPACE}">
        <soapenv:Header/>
        <soapenv:Body>
          <ecu:registrarClickSellProducto>
            <productId>${productId}</productId>
          </ecu:registrarClickSellProducto>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    return this.http.post(this.API_URL, soapBody, { headers: this.defaultHeaders, responseType: 'text' }).pipe(
      tap(resp => console.log('✅ registrarClickSellProducto:', resp)),
      catchError(error => this.handleError('registrarClickSellProducto', error))
    );
  }

  /**
   * 6. GUARDAR REGISTRO COMPLETO
   * Parámetro: registroXml (String) - XML con los datos del registro completo (RegistroCompletoRequest)
   * Estructura esperada del objeto (aproximada, basada en WSDL):
   * {
   *   campo1: valor1,
   *   campo2: valor2,
   *   ...
   * }
   * 
   * NOTA: Revisa el WSDL importado (EcuayapaAction.wsdl) para conocer la estructura exacta de RegistroCompletoRequest
   * Retorna: confirmación de guardado
   */
  guardarRegistroCompleto(registroXml: string): Observable<string> {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ecu="${this.NAMESPACE}">
        <soapenv:Header/>
        <soapenv:Body>
          <ecu:guardarRegistroCompleto>
            ${registroXml}
          </ecu:guardarRegistroCompleto>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    return this.http.post(this.API_URL, soapBody, { headers: this.defaultHeaders, responseType: 'text' }).pipe(
      tap(resp => console.log('✅ guardarRegistroCompleto:', resp)),
      catchError(error => this.handleError('guardarRegistroCompleto', error))
    );
  }

   private escapeXml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Manejo de errores centralizado
   */
  private handleError(operation: string, error: any) {
    console.error(`❌ Error en ${operation}:`, error);
    return throwError(() => ({
      operation,
      message: error.message || 'Error desconocido',
      status: error.status,
      error
    }));
  }
  }