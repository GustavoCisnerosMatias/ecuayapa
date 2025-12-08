import { Routes } from '@angular/router';
import { ComprarComponent } from './pages/comprar';
import { VenderComponent } from './pages/vender';
import { MapaComponent } from './pages/mapa';
import { BannerComponent } from './components/banner/banner';

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
    path: 'welcome',
    component: BannerComponent,
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
