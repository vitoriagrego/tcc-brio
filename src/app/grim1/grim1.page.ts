import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

interface Runa {
  id: number;
  nome: string;
  descricao: string;
  icone: string;
  desbloqueada: boolean;
}

@Component({
  selector: 'app-grim1',
  templateUrl: './grim1.page.html',
  styleUrls: ['./grim1.page.scss'],
  standalone: false
})
export class Grim1Page {
  paginaAtual: number = 0;
  itensPorPagina: number = 5;
  folhaVirando: boolean = false;
  animando: boolean = false;

  todasRunas: Runa[] = [
    { id: 1, nome: 'Aura de Lunareth', descricao: 'FOCO EM MOMENTOS DIFÍCEIS / TRAZER ENERGIA', icone: 'assets/runas/lunareth.png', desbloqueada: true },
    { id: 2, nome: 'Aura de Ignivar', descricao: 'ENERGIA INTENSA, FOCO EXTREMO', icone: 'assets/runas/ignivar.png', desbloqueada: true },
    { id: 3, nome: 'Aura de Aethérion', descricao: 'DOMÍNIO DA MENTE E CLAREZA TOTAL', icone: 'assets/runas/aetherion.png', desbloqueada: true },
    { id: 4, nome: 'Aura do Ciclo Arcano', descricao: 'ROTINA CONSISTENTE', icone: 'assets/runas/ciclo.png', desbloqueada: true },
    { id: 5, nome: 'Aura da Transmutação Áurea', descricao: 'COMPLETAR TAREFAS DIFÍCEIS COM EXCELÊNCIA', icone: 'assets/runas/transmutacao.png', desbloqueada: true },
    { id: 6, nome: 'Aura de Eldoria', descricao: 'RESISTÊNCIA A DISTRAÇÕES', icone: 'assets/runas/eldoria.png', desbloqueada: false },
    { id: 7, nome: 'Aura do Sábio', descricao: 'MEMORIZAÇÃO DE LONGO PRAZO', icone: 'assets/runas/sabio.png', desbloqueada: false }
  ];

  constructor(private navCtrl: NavController) {}

  get runasPaginaAtual(): Runa[] {
    const inicio = this.paginaAtual * this.itensPorPagina;
    return this.todasRunas.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.todasRunas.length / this.itensPorPagina);
  }

  proximaPagina() {
    if (this.paginaAtual < this.totalPaginas - 1 && !this.animando) {
      this.animando = true;
      this.folhaVirando = true;

      // Troca os dados na metade do efeito
      setTimeout(() => {
        this.paginaAtual++;
      }, 300);

      // Finaliza a animação
      setTimeout(() => {
        this.folhaVirando = false;
        this.animando = false;
      }, 600);
    }
  }

  paginaAnterior() {
    if (this.paginaAtual > 0 && !this.animando) {
      this.animando = true;
      this.folhaVirando = true;

      setTimeout(() => {
        this.paginaAtual--;
      }, 300);

      setTimeout(() => {
        this.folhaVirando = false;
        this.animando = false;
      }, 600);
    }
  }

  voltarTab2() {
    this.navCtrl.navigateBack('/tabs/tab2');
  }

  irParaGrim2() {
    this.navCtrl.navigateForward('/grim2');
  }
}