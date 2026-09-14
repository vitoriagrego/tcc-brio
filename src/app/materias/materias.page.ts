import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

interface Materia {
  id: string;
  nome: string;
  categoria: 'humanas' | 'exatas' | 'biologicas';
  nivel: number;
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
    { id: 'matematica', nome: 'Matemática', categoria: 'exatas', nivel: 3, progresso: 50, imagem: '/assets/materias/mat.png', favorita: true },
    { id: 'historia', nome: 'História', categoria: 'humanas', nivel: 4, progresso: 25, imagem: '/assets/materias/historia.png', favorita: false },
    { id: 'geografia', nome: 'Geografia', categoria: 'humanas', nivel: 4, progresso: 50, imagem: '/assets/materias/geo.png', favorita: true },
    { id: 'biologia', nome: 'Biologia', categoria: 'biologicas', nivel: 3, progresso: 30, imagem: '/assets/materias/biologia.png', favorita: false },
    { id: 'fisica', nome: 'Física', categoria: 'exatas', nivel: 3, progresso: 75, imagem: '/assets/materias/fisica.png', favorita: true },
    { id: 'quimica', nome: 'Química', categoria: 'exatas', nivel: 4, progresso: 80, imagem: '/assets/materias/quimica.png', favorita: false }
  ];

  constructor(private navCtrl: NavController) {}

  ngOnInit() {}

  get materiasFiltradas(): Materia[] {
    if (this.filtroSelecionado === 'todas') return this.materias;
    if (this.filtroSelecionado === 'favoritas') return this.materias.filter(m => m.favorita);
    return this.materias.filter(m => m.categoria === this.filtroSelecionado);
  }

  selecionarFiltro(filtro: string) {
    this.filtroSelecionado = filtro;
  }

  voltar() {
    this.navCtrl.back();
  }

  estudarMateria(materia: Materia) {
    console.log('Estudar:', materia.nome);
  }

  exerciciosMateria(materia: Materia) {
    console.log('Exercícios:', materia.nome);
  }
}