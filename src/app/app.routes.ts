import { Routes } from '@angular/router';
import { ComprarComponent } from './pages/comprar';
import { VenderComponent } from './pages/vender';
import { MapaComponent } from './pages/mapa';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/comprar',
    pathMatch: 'full',
  },
  {
    path: 'comprar',
    component: ComprarComponent,
  },
  {
    path: 'vender',
    component: VenderComponent,
  },
  {
    path: 'mapa',
    component: MapaComponent,
  },
  {
    path: '**',
    redirectTo: '/comprar',
  },
];
