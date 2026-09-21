import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

interface Materia {
  id: string;
  nome: string;
  categoria: 'humanas' | 'exatas' | 'biologicas';
  imagem: string;
  favorita: boolean;
}

@Component({
  selector: 'app-materias',
  templateUrl: './materias.page.html',
  styleUrls: ['./materias.page.scss'],
  standalone: false
})
export class MateriasPage implements OnInit {

  filtroSelecionado: string = 'todas';

  materias: Materia[] = [

    {
      id: 'matematica',
      nome: 'Matemática',
      categoria: 'exatas',
      imagem: '/assets/materias/mat.png',
      favorita: true
    },

    {
      id: 'historia',
      nome: 'História',
      categoria: 'humanas',
      imagem: '/assets/materias/historia.png',
      favorita: false
    },

    {
      id: 'geografia',
      nome: 'Geografia',
      categoria: 'humanas',
      imagem: '/assets/materias/geo.png',
      favorita: true
    },

    {
      id: 'biologia',
      nome: 'Biologia',
      categoria: 'biologicas',
      imagem: '/assets/materias/biologia.png',
      favorita: false
    },

    {
      id: 'fisica',
      nome: 'Física',
      categoria: 'exatas',
      imagem: '/assets/materias/fisica.png',
      favorita: true
    },

    {
      id: 'quimica',
      nome: 'Química',
      categoria: 'exatas',
      imagem: '/assets/materias/quimica.png',
      favorita: false
    }

  ];


  constructor(
    private navCtrl: NavController
  ) {}


  ngOnInit(): void {
  }


  get materiasFiltradas(): Materia[] {

    if (this.filtroSelecionado === 'todas') {
      return this.materias;
    }

    if (this.filtroSelecionado === 'favoritas') {
      return this.materias.filter(
        materia => materia.favorita
      );
    }

    return this.materias.filter(
      materia => materia.categoria === this.filtroSelecionado
    );
  }


  selecionarFiltro(filtro: string): void {

    this.filtroSelecionado = filtro;

  }


  voltar(): void {
    this.navCtrl.navigateBack('/tabs/tab2');
  }


  estudarMateria(materia: Materia): void {

    switch (materia.id) {

      case 'matematica':
        this.navCtrl.navigateForward('/matematica');
        break;

      case 'historia':
        this.navCtrl.navigateForward('/historia');
        break;

      case 'geografia':
        this.navCtrl.navigateForward('/geografia');
        break;

      case 'biologia':
        this.navCtrl.navigateForward('/biologia');
        break;

      case 'fisica':
        this.navCtrl.navigateForward('/fisica');
        break;

      case 'quimica':
        this.navCtrl.navigateForward('/quimica');
        break;

      default:
        console.log(
          'Matéria não encontrada:',
          materia.id
        );

    }

  }


  exerciciosMateria(materia: Materia): void {

    console.log(
      'Exercícios:',
      materia.nome
    );

  }

}