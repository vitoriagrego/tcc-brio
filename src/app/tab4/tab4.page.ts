import { Component } from '@angular/core';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: false,
})
export class Tab4Page {

  levels = [
    { id: 2, label: 'Mestre', active: false },
    { id: 3, label: 'Aprendiz', active: false },
    { id: 4, label: 'Iniciado', active: true },
    { id: 5, label: 'Veterano', active: false },
    { id: 6, label: 'Lenda', active: false }
  ];

  rewards = [
    {
      title: 'Frasco Violeta',
      image: '../../assets/pocaoRec.png'
    },
    {
      title: 'Fumaça Estelar',
      image: '../../assets/fumacaRec.png'
    },
    {
      title: 'Runa da Clareza',
      image: '../../assets/runaRec.png'
    },
    {
      title: 'Chapéu Arcano',
      image: '../../assets/chapeuRec.png'
    }
  ];

  chartData = [80, 92, 60, 85, 70, 95, 65, 78];

}