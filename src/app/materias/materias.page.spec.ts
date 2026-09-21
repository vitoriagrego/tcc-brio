import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

interface Materia {
  id: string;
  nome: string;
  categoria: 'humanas' | 'exatas' | 'biologicas';
  progresso: number;
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
      progresso: 50,
      imagem: '/assets/materias/mat.png',
      favorita: true
    },

    {
      id: 'historia',
      nome: 'História',
      categoria: 'humanas',
      progresso: 25,
      imagem: '/assets/materias/historia.png',
      favorita: false
    },

    {
      id: 'geografia',
      nome: 'Geografia',
      categoria: 'humanas',
      progresso: 50,
      imagem: '/assets/materias/geo.png',
      favorita: true
    },

    {
      id: 'biologia',
      nome: 'Biologia',
      categoria: 'biologicas',
      progresso: 30,
      imagem: '/assets/materias/biologia.png',
      favorita: false
    },

    {
      id: 'fisica',
      nome: 'Física',
      categoria: 'exatas',
      progresso: 75,
      imagem: '/assets/materias/fisica.png',
      favorita: true
    },

    {
      id: 'quimica',
      nome: 'Química',
      categoria: 'exatas',
      progresso: 80,
      imagem: '/assets/materias/quimica.png',
      favorita: false
    }

  ];


  constructor(
    private navCtrl: NavController
  ) {}


  ngOnInit(): void {
  }


  // FILTRAR MATÉRIAS
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


  // SELECIONAR FILTRO
  selecionarFiltro(filtro: string): void {

    this.filtroSelecionado = filtro;

  }


  // VOLTAR
  voltar(): void {

    this.navCtrl.back();

  }


  // IR PARA A PÁGINA DE ESTUDOS
  estudarMateria(materia: Materia): void {

    console.log('Abrindo matéria:', materia.nome);

    this.navCtrl.navigateForward(
      `/estudar/${materia.id}`
    );

  }


  // EXERCÍCIOS
  exerciciosMateria(materia: Materia): void {

    console.log(
      'Exercícios:',
      materia.nome
    );

  }

}