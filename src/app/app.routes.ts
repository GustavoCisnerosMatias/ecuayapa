import { Routes } from '@angular/router';
import{ Welcome as WelcomeMapComponent} from './components/welcome/welcome';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeMapComponent,   // Página inicial
  },
  {
    path: '**',
    redirectTo: ''
  }
];