import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
  nivel = 17;
  xp = 70;

  tarefas = [
    {
      titulo: 'Estudar para a prova de Biologia',
      tempo: '1h30m'
    },
    {
      titulo: 'Leitura longa e profunda',
      tempo: '2 horas'
    }
  ];

}
