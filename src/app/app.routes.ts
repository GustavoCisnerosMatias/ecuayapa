import { Routes } from '@angular/router';
import { ComprarComponent } from './pages/comprar/comprar';
import { VenderComponent } from './pages/vender/vender';
import { BannerComponent } from './components/banner/banner';
import { Welcome } from './components/welcome/welcome';
export const routes: Routes = [
  {
    path: '',
    component: BannerComponent,
    data: { showHeader: false, showFooter: false }
  },
  {
    path: 'comprar',
    component: ComprarComponent,
    data: { showHeader: true, showFooter: true }
  },
  {
    path: 'welcome',
    component: BannerComponent,
    data: { showHeader: false, showFooter: false }
  },
  {
    path: 'vender',
    component: VenderComponent,
    data: { showHeader: true, showFooter: true }
  },
  {
    path: 'mapa',
    component: Welcome,
    data: { showHeader: true, showFooter: true }
  },
  {
    path: '**',
    redirectTo: '',
  },
];
