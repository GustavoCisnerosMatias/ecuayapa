# Instalación y Uso de SweetAlert2

## 1. Instalar SweetAlert2

Ejecuta este comando en la terminal:

```powershell
npm install sweetalert2
```

## 2. El Servicio

El servicio `Sweetalert2Service` ya está creado en:
```
src/app/services/sweetalert2.ts
```

## 3. Métodos Disponibles

### 🔴 Error - Alerta Modal con Botón
```typescript
this.sweetAlertService.error('Error', 'Algo salió mal');
```
- Muestra modal con ícono rojo
- Botón rojo de confirmación
- Se cierra al hacer clic

### 🟢 Éxito - Alerta Modal con Botón
```typescript
this.sweetAlertService.success('¡Éxito!', 'Operación completada');
```
- Muestra modal con ícono verde
- Botón verde de confirmación
- Se cierra al hacer clic

### ❓ Pregunta - Alerta Modal con Sí/No
```typescript
const result = await this.sweetAlertService.question('Confirmar', '¿Deseas continuar?');
if (result) {
  // Usuario hizo clic en Sí
} else {
  // Usuario hizo clic en No
}
```
- Muestra modal con ícono azul
- Dos botones: Sí (azul) y No (gris)
- Retorna boolean

### 🟢 Toast Éxito - Notificación Auto-cierre
```typescript
this.sweetAlertService.successToast('Guardado', 'Cambios guardados exitosamente');
```
- Aparece en esquina inferior derecha
- Se cierra automáticamente en 2 segundos (configurable)
- Fondo verde claro

### 🔴 Toast Error - Notificación Auto-cierre
```typescript
this.sweetAlertService.errorToast('Error', 'No se pudo guardar');
```
- Aparece en esquina inferior derecha
- Se cierra automáticamente en 2 segundos (configurable)
- Fondo rojo claro

## 4. Cómo Usar en un Componente

```typescript
import { Component } from '@angular/core';
import { Sweetalert2Service } from './services/sweetalert2';

@Component({
  selector: 'app-example',
  template: `<button (click)="testAlert()">Test Alert</button>`
})
export class ExampleComponent {
  
  constructor(private sweetAlertService: Sweetalert2Service) {}
  
  async testAlert() {
    // Error
    this.sweetAlertService.error('Error', 'Algo falló');
    
    // Éxito
    this.sweetAlertService.success('Éxito', 'Operación exitosa');
    
    // Pregunta
    const confirmed = await this.sweetAlertService.question('Confirmar', '¿Continuar?');
    console.log('Usuario confirmó:', confirmed);
    
    // Toast éxito
    this.sweetAlertService.successToast('Guardado');
    
    // Toast error
    this.sweetAlertService.errorToast('Error al procesar');
  }
}
```

## 5. Resumen de los 4 Tipos

| Tipo | Modal/Toast | Botones | Uso |
|------|-----------|---------|-----|
| **error()** | Modal | 1 (Aceptar) | Mostrar errores |
| **success()** | Modal | 1 (Aceptar) | Confirmar éxito |
| **question()** | Modal | 2 (Sí/No) | Pedir confirmación |
| **successToast()** | Toast | Ninguno | Notificación temporal éxito |
| **errorToast()** | Toast | Ninguno | Notificación temporal error |

---

**Después de instalar `npm install sweetalert2`, los errores de compilación desaparecerán.**
