import { Component, OnInit } from '@angular/core';

interface Materia {
  nome: string;
  imagem: string;
}

@Component({
  selector: 'app-questionario',
  templateUrl: './questionario.page.html',
  styleUrls: ['./questionario.page.scss'],
  standalone: false,
})
export class QuestionarioPage implements OnInit {

  // Variáveis para controlo dos filtros e matérias
  filtroSelecionado: string = 'todas';
  
  materias: Materia[] = [
    { nome: 'Matemática', imagem: 'assets/icones/matematica.png' },
    { nome: 'História', imagem: 'assets/icones/historia.png' },
    { nome: 'Geografia', imagem: 'assets/icones/geografia.png' },
    { nome: 'Biologia', imagem: 'assets/icones/biologia.png' },
    { nome: 'Física', imagem: 'assets/icones/fisica.png' },
    { nome: 'Química', imagem: 'assets/icones/quimica.png' }
  ];

  materiasFiltradas: Materia[] = [];

  // Variáveis para controlo da "Tela" de Exercícios
  exibindoExercicios: boolean = false;
  materiaSelecionada: Materia | null = null;

  constructor() { }

  ngOnInit() {
    this.materiasFiltradas = this.materias;
  }

  selecionarFiltro(filtro: string) {
    this.filtroSelecionado = filtro;
    if (filtro === 'todas') {
      this.materiasFiltradas = this.materias;
    }
  }

  estudarMateria(materia: Materia) {
    console.log('A estudar:', materia.nome);
  }

  // Função para abrir a vista de exercícios
  abrirExercicios(materia: Materia) {
    this.materiaSelecionada = materia;
    this.exibindoExercicios = true;
  }

  // Função para fechar a vista de exercícios e voltar à lista
  fecharExercicios() {
    this.exibindoExercicios = false;
    this.materiaSelecionada = null;
  }

  // Função do botão Voltar da barra superior
  voltar() {
    if (this.exibindoExercicios) {
      this.fecharExercicios();
    } else {
      // Lógica padrão de navegação para voltar atrás na aplicação (ex: NavController)
      console.log('A voltar à página anterior...');
    }
  }
}