# ECUAYAPA - Estructura de la Aplicación

## 📋 Descripción General

ECUAYAPA es una plataforma e-commerce del Ministerio de Desarrollo Humano para comprar, vender y localizar vehículos en todo Ecuador, con colores oficiales del gobierno.

### Colores Oficiales

- **Amarillo**: #FFC003
- **Azul**: #2D2D96
- **Rojo**: #FD0118

---

## 🏗️ Estructura de Carpetas

```
src/app/
├── components/
│   ├── header/
│   │   ├── header.ts          # Componente de encabezado
│   │   ├── header.html
│   │   └── header.scss
│   ├── footer/
│   │   ├── footer.ts          # Componente de pie de página
│   │   ├── footer.html
│   │   └── footer.scss
│   ├── banner/
│   │   ├── banner.ts          # Banner principal
│   │   ├── banner.html
│   │   └── banner.scss
│   ├── products/
│   │   ├── products.ts        # Grid de vehículos
│   │   ├── products.html
│   │   └── products.scss
│   └── welcome/               # Componente original
├── pages/
│   ├── comprar.ts             # Página de compra
│   ├── comprar.html
│   ├── comprar.scss
│   ├── vender.ts              # Página para vender
│   ├── vender.html
│   ├── vender.scss
│   ├── mapa.ts                # Página con mapa interactivo
│   ├── mapa.html
│   └── mapa.scss
├── app.ts
├── app.html
├── app.scss
└── app.routes.ts
```

---

## 🎨 Componentes Principales

### 1. **Header (Encabezado)**

- Logo y nombre: "ECUAYAPA - Ministerio de Desarrollo Humano"
- Menú de navegación con 3 opciones:
  1. **Comprar** (Carrito) - página principal
  2. **Vender** (Signo +) - formulario para publicar
  3. **Ver en Mapa** (Mapa) - vista de ubicaciones

Estilos:

- Fondo con gradiente épico: Amarillo → Azul → Rojo
- Efecto hover en los botones
- Responsive para móviles

### 2. **Banner (Sección Principal)**

- Título grande y atractivo
- Subtítulo descriptivo
- Botón CTA "Explorar Ahora"
- Animación de gradiente en el fondo
- Altura: 400px (ajustable en móviles)

### 3. **Productos (Grid de Vehículos)**

- Muestra vehículos disponibles en formato tarjeta
- Cada tarjeta incluye:
  - Imagen del vehículo
  - Badge "Destacado" (para productos favoritos)
  - Título, año y kilometraje
  - Ubicación (con icono rojo)
  - Precio en formato USD
  - Botón "Interesado"
- Filtros por marca y ordenamiento
- Efecto hover con zoom en imagen
- Grid responsivo (3 columnas en desktop, 1 en móvil)

### 4. **Footer (Pie de Página)**

- Sección de contacto (teléfono, email, dirección)
- Enlaces útiles (Acerca de, T&C, Política, FAQ)
- Redes sociales con iconos
- Copyright y créditos

---

## 📄 Páginas

### Página: `/comprar` (Comprar)

- Banner principal
- Grid de productos con filtros
- Acciones: Ver detalles, contactar, mostrar interés

### Página: `/vender` (Vender)

- Formulario para publicar vehículo
- Campos:
  - Marca y modelo
  - Año y precio
  - Kilometraje
  - Ubicación (dropdown de provincias)
  - Descripción
  - Carga de fotos
- Botón de envío con validaciones

### Página: `/mapa` (Ver en Mapa)

- Mapa interactivo con Leaflet
- Marcadores con información de vehículos
- Popup con detalles al hacer clic
- Ubicaciones predefinidas en principales ciudades:
  - Quito
  - Guayaquil
  - Cuenca
  - Ambato

---

## 🎯 Rutas Disponibles

```typescript
// app.routes.ts
{
  path: '',              → /comprar (redirige)
  path: 'comprar',       → Página de compra
  path: 'vender',        → Formulario de venta
  path: 'mapa',          → Vista de mapa
  path: '**'             → Redirige a /comprar
}
```

---

## 🌈 Estilos Globales

### Variables CSS

```scss
--color-primary: #2D2D96 (Azul)
--color-secondary: #FFC003 (Amarillo)
--color-accent: #FD0118 (Rojo)
--color-light: #f8f9fa
```

### Animaciones Globales

- `fade-in`: Desvanecimiento
- `slide-up`: Deslizamiento hacia arriba
- `gradient-shift`: Animación de gradiente en el banner

### Transiciones

- Todas las interacciones tienen transiciones suaves (0.3s)
- Hover effects en botones y tarjetas

---

## 📱 Responsividad

- **Desktop**: Layout completo, 3 columnas en grid
- **Tablet**: 2 columnas, ajustes de padding
- **Mobile**: 1 columna, font sizes reducidos, hamburger menu

---

## 🔧 Dependencias

```json
{
  "@angular/core": "^21.0.0",
  "@angular/router": "^21.0.0",
  "leaflet": "^1.9.4",
  "@fortawesome/fontawesome-free": "^7.1.0",
  "sweetalert2": "^11.26.3"
}
```

---

## ✨ Características Especiales

1. **Diseño Épico**: Gradientes de 3 colores en header y banner
2. **Componentes Reutilizables**: Standalone components de Angular 21
3. **Interactividad**: Hover effects, animaciones suaves
4. **Mapas Integrados**: Leaflet para visualización geográfica
5. **Formularios**: Validación y manejo de datos
6. **Icons**: Font Awesome para iconografía consistente

---

## 🚀 Pasos Siguientes

Para poder visualizar en el navegador:

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Iniciar servidor de desarrollo:

   ```bash
   npm start
   ```

3. Abrir en navegador: `http://localhost:4200`

4. Para ver la vista previa estática: abrir `PREVIEW.html` en el navegador

---

## 📞 Contacto y Datos

- **Teléfono**: +593 (2) 3814-000
- **Email**: info@desarrollo.gob.ec
- **Dirección**: Av. Amazonas y Atahualpa, Quito, Ecuador

---

**Última actualización**: Diciembre 7, 2024
