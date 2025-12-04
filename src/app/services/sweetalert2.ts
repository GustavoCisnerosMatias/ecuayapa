import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Sweetalert2Service {
  
  // ================================
  // ALERTA DE ERROR
  // ================================
  error(title: string, message: string) {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#dc2626',
      background: '#fff',
      showConfirmButton: true,
      customClass: {
        container: 'swal-container',
        title: 'swal-title',
        htmlContainer: 'swal-text',
      }
    });
  }

  // ================================
  // ALERTA DE ÉXITO
  // ================================
  success(title: string, message: string) {
    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#10b981',
      background: '#fff',
      showConfirmButton: true,
      customClass: {
        container: 'swal-container',
        title: 'swal-title',
        htmlContainer: 'swal-text',
      }
    });
  }

  // ================================
  // ALERTA DE ADVERTENCIA (NARANJA)
  // ================================
  warning(title: string, message: string) {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#f97316',
      background: '#fff',
      showConfirmButton: true,
      customClass: {
        container: 'swal-container',
        title: 'swal-title',
        htmlContainer: 'swal-text',
      }
    });
  }


  async question(title: string, message: string): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'question',
      title: title,
      text: message,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      background: '#fff',
      showConfirmButton: true,
      showCancelButton: true,
      reverseButtons: false,
      customClass: {
        container: 'swal-container',
        title: 'swal-title',
        htmlContainer: 'swal-text',
      }
    });
    
    return result.isConfirmed;
  }

  // ================================
  // ALERTA DE ÉXITO CON AUTO-CIERRE (Toast)
  // ================================
  successToast(title: string, message: string = '', duration: number = 2000) {
    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      toast: true,
      position: 'bottom-right',
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      background: '#ecfdf5',
      customClass: {
        container: 'swal-toast-container',
        title: 'swal-toast-title',
        htmlContainer: 'swal-toast-text',
      }
    });
  }

  // ================================
  // ALERTA DE ERROR CON AUTO-CIERRE (Toast)
  // ================================
  errorToast(title: string, message: string = '', duration: number = 2000) {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      toast: true,
      position: 'bottom-right',
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      background: '#fef2f2',
      customClass: {
        container: 'swal-toast-container',
        title: 'swal-toast-title',
        htmlContainer: 'swal-toast-text',
      }
    });
  }

  // ================================
  // ALERTA DE ADVERTENCIA CON AUTO-CIERRE (Toast)
  // ================================
  warningToast(title: string, message: string = '', duration: number = 2000) {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      toast: true,
      position: 'bottom-right',
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      background: '#fffbeb',
      customClass: {
        container: 'swal-toast-container',
        title: 'swal-toast-title',
        htmlContainer: 'swal-toast-text',
      }
    });
  }
}
