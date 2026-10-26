import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase';

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
  concluida: boolean;
  subtarefas: Subtarefa[];
  materiaId?: string;
  xp?: number; // recompensa em XP (coluna blocos_estudo.xp)
}

export interface Materia {
  id: string;
  nome: string;
}

@Component({
  selector: 'app-grim2',
  templateUrl: './grim2.page.html',
  styleUrls: ['./grim2.page.scss'],
  standalone: false
})
export class Grim2Page implements OnInit {
  diasSemana: string[] = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  diaAtivoIndex: number = 0;
  folhaVirando: boolean = false;
  animando: boolean = false;

  exibirModal: boolean = false;
  novaTarefaTitulo: string = '';
  novaTarefaTempo: string = '';
  materiaSelecionadaId: string | null = null;

  listaMaterias: Materia[] = [];

  tarefasPorDia: { [key: number]: Tarefa[] } = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  };

  constructor(
    private navCtrl: NavController,
    private ionicAlertCtrl: AlertController,
    private toastCtrl: ToastController,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    await this.carregarMaterias();
    await this.carregarTarefasDoBanco();
  }

  async ionViewWillEnter() {
    await this.carregarMaterias();
    await this.carregarTarefasDoBanco();
  }

  get tarefasDiaAtual(): Tarefa[] {
    return this.tarefasPorDia[this.diaAtivoIndex] || [];
  }

  // =====================================================
  // GERENCIAMENTO DE MATÉRIAS (MÉTODOS CHAMADOS NO HTML)
  // =====================================================

  async carregarMaterias() {
    try {
      const { data, error } = await this.supabaseService.client
        .from('materias')
        .select('id, nome')
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao carregar matérias:', error);
        return;
      }

      if (data && data.length > 0) {
        this.listaMaterias = data;
        if (!this.materiaSelecionadaId) {
          this.materiaSelecionadaId = data[0].id;
        }
      } else {
        this.listaMaterias = [];
      }
    } catch (err) {
      console.error('Erro de conexão ao carregar matérias:', err);
    }
  }

  async promptCriarNovaMateria() {
    const alertPrompt = await this.ionicAlertCtrl.create({
      header: 'Nova Matéria',
      inputs: [
        {
          name: 'nomeMateria',
          type: 'text',
          placeholder: 'Ex: Matemática, Alquimia...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salvar',
          handler: (data: { nomeMateria?: string }) => {
            const nomeFormatado = data.nomeMateria?.trim();
            if (!nomeFormatado) {
              window.alert('Digite o nome da matéria.');
              return false;
            }

            this.executarCadastroMateria(nomeFormatado);
            return true;
          }
        }
      ]
    });

    await alertPrompt.present();
  }

  private async executarCadastroMateria(nome: string) {
    try {
      const { data: novaMat, error } = await this.supabaseService.client
        .from('materias')
        .insert({ nome })
        .select()
        .single();

      if (error) {
        window.alert('Erro ao salvar matéria: ' + error.message);
        return;
      }

      if (novaMat) {
        await this.carregarMaterias();
        this.materiaSelecionadaId = novaMat.id;
      }
    } catch (err) {
      console.error('Erro ao cadastrar matéria:', err);
    }
  }

  async excluirMateria() {
    await this.carregarMaterias();

    if (this.listaMaterias.length === 0) {
      window.alert('Nenhuma matéria cadastrada para excluir.');
      return;
    }

    const inputsOptions = this.listaMaterias.map((m) => ({
      label: m.nome,
      type: 'radio' as const,
      value: m.id
    }));

    const alertDelete = await this.ionicAlertCtrl.create({
      header: 'Excluir Matéria',
      message: 'Selecione a matéria que deseja remover:',
      inputs: inputsOptions,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: (materiaId: string) => {
            if (!materiaId) return false;
            this.executarExclusaoMateria(materiaId);
            return true;
          }
        }
      ]
    });

    await alertDelete.present();
  }

  private async executarExclusaoMateria(materiaId: string) {
    try {
      const { error } = await this.supabaseService.client
        .from('materias')
        .delete()
        .eq('id', materiaId);

      if (error) {
        window.alert('Erro ao excluir matéria: ' + error.message);
        return;
      }

      if (this.materiaSelecionadaId === materiaId) {
        this.materiaSelecionadaId = null;
      }

      await this.carregarMaterias();
    } catch (err) {
      console.error('Erro ao excluir matéria:', err);
    }
  }

  // =====================================================
  // TAREFAS E SUPABASE
  // =====================================================

  async carregarTarefasDoBanco() {
    try {
      const user = await this.supabaseService.getUsuarioAtual();
      if (!user) return;

      const { data: blocos, error } = await this.supabaseService.client
        .from('blocos_estudo')
        .select('*')
        .eq('user_id', user.id)
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar tarefas:', error);
        return;
      }

      if (blocos) {
        const listaMapeada: Tarefa[] = blocos.map((b, index) => ({
          id: b.id,
          titulo: b.titulo,
          tempo: b.conteudo_html_md || '30m',
          iconeGema: `assets/gemas/gema${(index % 3) + 1}.png`,
          expandido: false,
          concluida: b.concluido === true, // vem da coluna blocos_estudo.concluido
          subtarefas: [],
          materiaId: b.materia_id,
          xp: b.xp ?? 0
        }));

        this.tarefasPorDia[this.diaAtivoIndex] = listaMapeada;
      }
    } catch (err) {
      console.error('Erro ao carregar do Supabase:', err);
    }
  }

  async salvarNovaTarefa() {
    if (!this.novaTarefaTitulo.trim()) {
      window.alert('Informe o título da tarefa.');
      return;
    }

    const tituloValido = this.novaTarefaTitulo.trim().toUpperCase();
    const tempoValido = this.novaTarefaTempo.trim() || '30m';
    const xpRecompensa = this.calcularXpPorTempo(tempoValido);

    try {
      const user = await this.supabaseService.getUsuarioAtual();
      if (!user) {
        window.alert('Atenção: Você precisa estar logado para salvar tarefas.');
        return;
      }

      const { data, error } = await this.supabaseService.client
        .from('blocos_estudo')
        .insert({
          user_id: user.id,
          materia_id: this.materiaSelecionadaId || null,
          titulo: tituloValido,
          conteudo_html_md: tempoValido,
          concluido: false,
          xp: xpRecompensa
        })
        .select()
        .single();

      if (error) {
        console.error('Erro retornado pelo Supabase:', error);
        window.alert('Erro ao salvar no banco: ' + error.message);
        return;
      }

      if (data) {
        const novaTarefa: Tarefa = {
          id: data.id,
          titulo: data.titulo,
          tempo: data.conteudo_html_md,
          iconeGema: 'assets/gemas/gema1.png',
          expandido: false,
          concluida: false,
          subtarefas: [],
          materiaId: data.materia_id,
          xp: data.xp ?? xpRecompensa
        };

        if (!this.tarefasPorDia[this.diaAtivoIndex]) {
          this.tarefasPorDia[this.diaAtivoIndex] = [];
        }

        this.tarefasPorDia[this.diaAtivoIndex].push(novaTarefa);
        this.fecharModal();
      }
    } catch (err) {
      console.error('Erro ao conectar com o Supabase:', err);
    }
  }

  // Marca/desmarca o check da tarefa e grava em blocos_estudo.concluido.
  // Atualiza a tela na hora e desfaz se o banco recusar.
  async alternarConclusaoTarefa(tarefa: Tarefa, event: Event) {
    event.stopPropagation();

    const novoValor = !tarefa.concluida;
    tarefa.concluida = novoValor;

    try {
      const { error } = await this.supabaseService.client
        .from('blocos_estudo')
        .update({ concluido: novoValor })
        .eq('id', tarefa.id);

      if (error) {
        tarefa.concluida = !novoValor;
        window.alert('Erro ao atualizar conclusão: ' + error.message);
        return;
      }

      // O XP é somado/removido no perfil pelo trigger do banco; aqui só avisamos o usuário
      if (tarefa.xp) {
        await this.mostrarToastXp(novoValor ? `+${tarefa.xp} XP conquistados!` : `-${tarefa.xp} XP (tarefa reaberta)`);
      }
    } catch (err) {
      tarefa.concluida = !novoValor;
      console.error('Erro ao atualizar conclusão:', err);
    }
  }

  // Converte textos como "1h30m", "10min", "30m", "2 horas" ou "45" em minutos (padrão: 30)
  private converterTempoParaMinutos(texto: string): number {
    const t = (texto || '').toLowerCase().replace(',', '.').trim();
    let minutos = 0;

    const horas = t.match(/(\d+(?:\.\d+)?)\s*h/);
    if (horas) minutos += parseFloat(horas[1]) * 60;

    const mins = t.match(/(\d+)\s*m/);
    if (mins) minutos += parseInt(mins[1], 10);

    // Só um número, sem unidade: considera minutos
    if (!horas && !mins) {
      const soNumero = t.match(/^\d+$/);
      if (soNumero) minutos = parseInt(soNumero[0], 10);
    }

    return minutos > 0 ? Math.round(minutos) : 30;
  }

  // Recompensa de XP proporcional ao tempo: 1 XP a cada 3 minutos (mín. 5, máx. 100)
  private calcularXpPorTempo(tempoTexto: string): number {
    const minutos = this.converterTempoParaMinutos(tempoTexto);
    return Math.max(5, Math.min(100, Math.round(minutos / 3)));
  }

  private async mostrarToastXp(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 1800,
      position: 'top'
    });
    await toast.present();
  }

  async excluirTarefa(tarefa: Tarefa, event?: Event) {
    if (event) event.stopPropagation();

    const confirmAlert = await this.ionicAlertCtrl.create({
      header: 'Excluir Tarefa',
      message: `Deseja realmente remover "${tarefa.titulo}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.executarExclusaoTarefa(tarefa);
            return true;
          }
        }
      ]
    });

    await confirmAlert.present();
  }

  private async executarExclusaoTarefa(tarefa: Tarefa) {
    try {
      const { error } = await this.supabaseService.client
        .from('blocos_estudo')
        .delete()
        .eq('id', tarefa.id);

      if (error) {
        window.alert('Erro ao excluir do banco: ' + error.message);
        return;
      }

      this.tarefasPorDia[this.diaAtivoIndex] = this.tarefasPorDia[this.diaAtivoIndex].filter(
        t => t.id !== tarefa.id
      );
    } catch (err) {
      console.error('Erro de conexão ao excluir tarefa:', err);
    }
  }

  // =====================================================
  // CONTROLES DE INTERFACE
  // =====================================================

  toggleExpansao(tarefaSelecionada: Tarefa) {
    const estadoAtual = tarefaSelecionada.expandido;
    this.tarefasDiaAtual.forEach(t => t.expandido = false);
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
    this.novaTarefaTitulo = '';
    this.novaTarefaTempo = '';
  }

  selecionarDia(index: number) {
    if (this.diaAtivoIndex !== index && !this.animando) {
      this.animando = true;
      this.folhaVirando = true;

      setTimeout(() => {
        this.diaAtivoIndex = index;
        this.carregarTarefasDoBanco();
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