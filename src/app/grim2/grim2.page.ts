import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

export interface Subtarefa {
  id: string;
  titulo: string;
  concluida: boolean;
}

export interface Tarefa {
  id: string;
  titulo: string;
  tempo?: string;
  iconeGema?: string;
  expandido: boolean;
  subtarefas: Subtarefa[];
}

@Component({
  selector: 'app-grim2',
  templateUrl: './grim2.page.html',
  styleUrls: ['./grim2.page.scss'],
  standalone: false
})
export class Grim2Page {
  diasSemana: string[] = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  diaAtivoIndex: number = 0;
  folhaVirando: boolean = false;
  animando: boolean = false;

  exibirModal: boolean = false;
  novaTarefaTitulo: string = '';
  novaTarefaTempo: string = '';

  tarefasPorDia: { [key: number]: Tarefa[] } = {
    0: [
      { 
        id: '1', 
        titulo: 'ESTUDAR PARA A PROVA DE BIOLOGIA', 
        tempo: '1h30m', 
        iconeGema: 'assets/gemas/gema1.png',
        expandido: false,
        subtarefas: [
          { id: 's1', titulo: 'CAPÍTULO 1 AO 4', concluida: false },
          { id: 's2', titulo: 'EXERCÍCIOS DE FIXAÇÃO', concluida: false }
        ]
      },
      { 
        id: '2', 
        titulo: 'REFAZER O RELATÓRIO SOBRE RELAÇÕES PÚBLICAS', 
        tempo: '1h15m', 
        iconeGema: 'assets/gemas/gema2.png',
        expandido: false,
        subtarefas: [
          { id: 's3', titulo: 'FAZER RESUMO', concluida: true },
          { id: 's4', titulo: 'OBJETIVOS', concluida: true },
          { id: 's5', titulo: 'ATIVIDADES REALIZADAS', concluida: true },
          { id: 's6', titulo: 'CONCLUSÃO DE AMBAS', concluida: true },
          { id: 's7', titulo: 'ANÁLISE DE DADOS', concluida: true }
        ]
      },
      { 
        id: '3', 
        titulo: 'LEITURA LONGA E PROFUNDA', 
        tempo: '2horas', 
        iconeGema: 'assets/gemas/gema3.png',
        expandido: false,
        subtarefas: [] 
      }
    ]
  };

  constructor(private navCtrl: NavController) {}

  get tarefasDiaAtual(): Tarefa[] {
    return this.tarefasPorDia[this.diaAtivoIndex] || [];
  }

  // APENAS UMA TAREFA ABERTA POR VEZ
  toggleExpansao(tarefaSelecionada: Tarefa) {
    const estadoAtual = tarefaSelecionada.expandido;

    // Fecha todas as tarefas do dia
    this.tarefasDiaAtual.forEach(t => t.expandido = false);

    // Se a clicada não estava aberta, abre ela (se estava, ela se mantém fechada)
    tarefaSelecionada.expandido = !estadoAtual;
  }

  toggleSubtarefa(sub: Subtarefa, event: Event) {
    event.stopPropagation();
    sub.concluida = !sub.concluida;
  }

  adicionarSubtarefa(tarefa: Tarefa, inputElement: HTMLInputElement) {
    const texto = inputElement.value.trim();
    if (texto) {
      tarefa.subtarefas.push({
        id: Date.now().toString(),
        titulo: texto.toUpperCase(),
        concluida: false
      });
      inputElement.value = '';
    }
  }

  abrirModalNovaTarefa() {
    this.novaTarefaTitulo = '';
    this.novaTarefaTempo = '';
    this.exibirModal = true;
  }

  fecharModal() {
    this.exibirModal = false;
  }

  salvarNovaTarefa() {
    if (!this.novaTarefaTitulo.trim()) return;

    if (!this.tarefasPorDia[this.diaAtivoIndex]) {
      this.tarefasPorDia[this.diaAtivoIndex] = [];
    }

    const novaTarefa: Tarefa = {
      id: Date.now().toString(),
      titulo: this.novaTarefaTitulo.toUpperCase(),
      tempo: this.novaTarefaTempo,
      iconeGema: 'assets/gemas/gema1.png',
      expandido: false,
      subtarefas: []
    };

    this.tarefasPorDia[this.diaAtivoIndex].push(novaTarefa);
    this.fecharModal();
  }

  selecionarDia(index: number) {
    if (this.diaAtivoIndex !== index && !this.animando) {
      this.animando = true;
      this.folhaVirando = true;

      setTimeout(() => {
        this.diaAtivoIndex = index;
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

  irParaGrim1() {
    this.navCtrl.navigateBack('/grim1');
  }
}