import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

interface Materia {
  nome: string;
  imagem: string;
  rotaEstudo: string;
}

@Component({
  selector: 'app-materias',
  templateUrl: './materias.page.html',
  styleUrls: ['./materias.page.scss'],
  standalone: false,
})
export class MateriasPage implements OnInit {

  filtroSelecionado: string = 'todas';

  materias: Materia[] = [
    {
      nome: 'Matemática',
      imagem: 'assets/materias/mat.png',
      rotaEstudo: '/matematica'
    },
    {
      nome: 'História',
      imagem: 'assets/materias/historia.png',
      rotaEstudo: '/historia'
    },
    {
      nome: 'Geografia',
      imagem: 'assets/materias/geo.png',
      rotaEstudo: '/geografia'
    },
    {
      nome: 'Biologia',
      imagem: 'assets/materias/biologia.png',
      rotaEstudo: '/biologia'
    },
    {
      nome: 'Física',
      imagem: 'assets/materias/fisica.png',
      rotaEstudo: '/fisica'
    },
    {
      nome: 'Química',
      imagem: 'assets/materias/quimica.png',
      rotaEstudo: '/quimica'
    }
  ];

  constructor(private navCtrl: NavController) {}

  ngOnInit() {}

  get materiasFiltradas(): Materia[] {
    if (this.filtroSelecionado === 'todas') {
      return this.materias;
    }

    return this.materias.filter(
      materia => materia.nome === this.filtroSelecionado
    );
  }

  selecionarFiltro(filtro: string) {
    this.filtroSelecionado = filtro;
  }

  estudarMateria(materia: Materia) {
    this.navCtrl.navigateForward(materia.rotaEstudo);
  }

  abrirExercicios(materia: Materia) {
    this.navCtrl.navigateForward('/quiz-historia', {
      queryParams: {
        materia: materia.nome
      }
    });
  }

  voltar() {
    this.navCtrl.navigateBack('/tabs/tab2');
  }
}