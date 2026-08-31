import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {
  constructor() {
    this.inicializarTema();
  }

  inicializarTema() {
    const temaSalvo = localStorage.getItem('app_tema') || 'Noturno';
    if (temaSalvo === 'Diurno') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.add('theme-dark');
    }
  }
}