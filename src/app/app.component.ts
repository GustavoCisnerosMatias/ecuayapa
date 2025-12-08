import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { LocationModalComponent } from './components/location-modal/location-modal';
import { filter, map, Observable, startWith } from 'rxjs';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent, LocationModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
protected readonly title = 'ecuayapa';

  showHeader$!: Observable<boolean>;
  showFooter$!: Observable<boolean>;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    // Función auxiliar para obtener la ruta más profunda (deepest child)
    const getDeepestChild = (route: ActivatedRoute) => {
      while (route.firstChild) {
        route = route.firstChild;
      }
      return route;
    };

    // Observable para mostrar/ocultar header según la ruta activa
    this.showHeader$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        const child = getDeepestChild(this.activatedRoute);
        return child.snapshot.data['showHeader'] !== false; // true por defecto si no está definido
      }),
      startWith(getDeepestChild(this.activatedRoute).snapshot.data['showHeader'] !== false)
    );

    // Observable para mostrar/ocultar footer según la ruta activa
    this.showFooter$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        const child = getDeepestChild(this.activatedRoute);
        return child.snapshot.data['showFooter'] !== false; // true por defecto si no está definido
      }),
      startWith(getDeepestChild(this.activatedRoute).snapshot.data['showFooter'] !== false)
    );
  }
}
