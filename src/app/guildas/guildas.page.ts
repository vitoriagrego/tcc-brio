
import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';

interface EtapaDesafio {
  descricao: string;
  concluida: boolean;
}

interface Desafio {
  id: number;
  titulo: string;
  descricao: string;
  progressoAtual: number;
  progressoTotal: number;
  icone: string;
  corIcone: string;
  etapas: EtapaDesafio[];
}

@Component({
  selector: 'app-guildas',
  templateUrl: './guildas.page.html',
  styleUrls: ['./guildas.page.scss'],
  standalone: false
})
export class GuildaPage implements OnInit {

  segmentoSelecionado: string = 'feed';

  desafioSelecionado: Desafio | null = null;
  editandoDesafio: boolean = false;

  // Campos temporários para a edição
  tituloEdicao: string = '';
  descricaoEdicao: string = '';
  metaEdicao: number = 1;

  // ID do último desafio da lista
  ultimoDesafioId: number = 3;

  feedAtividades = [
    {
      usuario: 'Luna Mistifel',
      acao: 'Completou 3 transmutações',
      tempo: '2h',
      avatar: 'assets/avatar-mago.png'
    },
    {
      usuario: 'Aisbaldo Green',
      acao: 'Manteve a chama acesa por 10 dias',
      tempo: '5h',
      avatar: 'assets/avatar-alquimista.png'
    },
    {
      usuario: 'Isaac Newton',
      acao: 'Foco de mestre',
      tempo: '4h',
      avatar: 'assets/avatar-coruja.png'
    }
  ];

  desafios: Desafio[] = [
    {
      id: 1,
      titulo: 'Desafio das Transmutações',
      descricao: 'Concluir 15 transmutações e registrar seus resultados no grimório da guilda.',
      progressoAtual: 8,
      progressoTotal: 15,
      icone: 'flask-outline',
      corIcone: '#a855f7',
      etapas: [
        { descricao: 'Organizar os materiais de estudo.', concluida: false },
        { descricao: 'Realizar uma transmutação.', concluida: false },
        { descricao: 'Registrar o resultado no grimório.', concluida: false },
        { descricao: 'Revisar o conteúdo estudado.', concluida: false }
      ]
    },
    {
      id: 2,
      titulo: 'Manter a Chama Acesa',
      descricao: 'Estudar durante 10 dias, mantendo uma rotina de foco e registrando cada sessão concluída.',
      progressoAtual: 7,
      progressoTotal: 10,
      icone: 'flame-outline',
      corIcone: '#f97316',
      etapas: [
        { descricao: 'Estudar por pelo menos 25 minutos.', concluida: false },
        { descricao: 'Registrar a sessão de estudo.', concluida: false },
        { descricao: 'Revisar o conteúdo do dia.', concluida: false },
        { descricao: 'Planejar a próxima sessão.', concluida: false }
      ]
    },
    {
      id: 3,
      titulo: 'Evolução em Biologia',
      descricao: 'Alcançar 50 pontos de progresso em Biologia por meio de leituras, exercícios e revisões.',
      progressoAtual: 30,
      progressoTotal: 50,
      icone: 'leaf-outline',
      corIcone: '#22c55e',
      etapas: [
        { descricao: 'Ler um tópico de Biologia.', concluida: false },
        { descricao: 'Resolver exercícios do conteúdo.', concluida: false },
        { descricao: 'Revisar os erros cometidos.', concluida: false },
        { descricao: 'Fazer um resumo do assunto.', concluida: false }
      ]
    }
  ];

  rankingGuilda = [
    {
      posicao: 1,
      nome: 'Luna Mistifel',
      xp: '2.450 XP',
      avatar: 'assets/avatar-mago.png'
    },
    {
      posicao: 2,
      nome: 'Aisbaldo Green',
      xp: '1.980 XP',
      avatar: 'assets/avatar-alquimista.png'
    },
    {
      posicao: 3,
      nome: 'Isaac Newton',
      xp: '1.720 XP',
      avatar: 'assets/avatar-coruja.png'
    }
  ];

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {}

  // Alterna entre Feed, Desafios e Ranking
  segmentChanged(event: any): void {
    this.segmentoSelecionado = event.detail.value;
  }

  // Abre os detalhes do desafio escolhido
  verDesafio(desafioId: number): void {
    const desafio = this.desafios.find(d => d.id === desafioId);

    if (desafio) {
      this.desafioSelecionado = desafio;
      this.editandoDesafio = false;
    }
  }

  // Retorna para a lista na mesma página
  fecharDetalhes(): void {
    this.editandoDesafio = false;
    this.desafioSelecionado = null;
  }

  // Calcula a porcentagem da barra de progresso
  progressoPercentual(desafio: Desafio): number {
    if (desafio.progressoTotal <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (desafio.progressoAtual / desafio.progressoTotal) * 100
      )
    );
  }

  // Atualiza o progresso quando uma etapa é marcada
  async alternarEtapa(
    desafio: Desafio,
    etapa: EtapaDesafio,
    concluida: boolean
  ): Promise<void> {

    if (concluida && !etapa.concluida) {

      if (desafio.progressoAtual >= desafio.progressoTotal) {
        etapa.concluida = false;

        const alert = await this.alertCtrl.create({
          header: 'Desafio concluído',
          message: 'Você já atingiu a meta deste desafio!',
          buttons: ['Entendi']
        });

        await alert.present();
        return;
      }

      etapa.concluida = true;
      desafio.progressoAtual++;

    } else if (!concluida && etapa.concluida) {

      etapa.concluida = false;
      desafio.progressoAtual = Math.max(
        0,
        desafio.progressoAtual - 1
      );
    }
  }

  // Inicia a edição do último desafio
  iniciarEdicao(): void {
    if (!this.desafioSelecionado ||
        this.desafioSelecionado.id !== this.ultimoDesafioId) {
      return;
    }

    this.tituloEdicao = this.desafioSelecionado.titulo;
    this.descricaoEdicao = this.desafioSelecionado.descricao;
    this.metaEdicao = this.desafioSelecionado.progressoTotal;

    this.editandoDesafio = true;
  }

  // Salva as alterações
  async salvarEdicao(): Promise<void> {
    const desafio = this.desafioSelecionado;
    const novaMeta = Number(this.metaEdicao);

    if (!desafio || desafio.id !== this.ultimoDesafioId) {
      return;
    }

    if (
      !this.tituloEdicao.trim() ||
      !this.descricaoEdicao.trim() ||
      !Number.isFinite(novaMeta) ||
      !Number.isInteger(novaMeta) ||
      novaMeta < 1
    ) {
      const alert = await this.alertCtrl.create({
        header: 'Dados inválidos',
        message: 'Preencha o título, a descrição e uma meta inteira maior que zero.',
        buttons: ['OK']
      });

      await alert.present();
      return;
    }

    desafio.titulo = this.tituloEdicao.trim();
    desafio.descricao = this.descricaoEdicao.trim();
    desafio.progressoTotal = novaMeta;

    // Se a meta ficar abaixo do progresso atual,
    // ajusta o progresso para não ultrapassar 100%.
    desafio.progressoAtual = Math.min(
      desafio.progressoAtual,
      desafio.progressoTotal
    );

    this.editandoDesafio = false;
  }

  // Descarta as alterações não salvas
  cancelarEdicao(): void {
    this.editandoDesafio = false;
  }

  // Retorna à página anterior
  voltar(): void {
    this.navCtrl.navigateBack('/tabs/tab2');
  }
}