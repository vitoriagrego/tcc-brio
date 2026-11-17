import { Component } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

interface EtapaDesafio {
  id?: number;
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

interface FeedItem {
  usuario: string;
  acao: string;
  tempo: string;
  avatar: string;
}

interface Solicitacao {
  id: string;
  tipo: 'pedido' | 'convite';
  nome: string;
  guilda: string;
}

interface Membro {
  userId: string;
  nickname: string;
  avatar: string;
  xp: number;
  papel: 'criador' | 'membro';
  entrouEm: string;
}

@Component({
  selector: 'app-guildas',
  templateUrl: './guildas.page.html',
  styleUrls: ['./guildas.page.scss'],
  standalone: false
})
export class GuildaPage {
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  // Mesmo avatar padrão usado na página de perfil (tab5)
  private readonly avatarPadrao = 'assets/perfil.png';

  // true só na primeira carga, para não piscar a tela de ingresso
  carregando = true;

  segmentoSelecionado: string = 'feed';
  desafioSelecionado: Desafio | null = null;

  // Guilda do usuário atual
  minhaGuildaId: string | null = null;
  minhaGuildaNome = '';
  souCriador = false;

  // Feed real (tabela feed_guilda)
  feedAtividades: FeedItem[] = [];

  // Pedidos recebidos (criador) e convites recebidos (qualquer usuário)
  solicitacoes: Solicitacao[] = [];

  // Membros da guilda (criador e membros) e ranking derivado deles
  membros: Membro[] = [];
  rankingGuilda: Array<{ posicao: number; nome: string; xp: string; avatar: string }> = [];

  // Buscas
  guildasBusca: Array<{ id: string; nome: string; descricao: string }> = [];
  usuariosBusca: Array<{ id: string; nickname: string }> = [];

  // Guildas para as quais o usuário já enviou pedido nesta sessão
  pedidosEnviados = new Set<string>();

  desafios: Desafio[] = [];

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {}

  async ionViewWillEnter(): Promise<void> {
    await this.carregarDadosBanco();
  }

  // Desafios de exemplo, usados apenas se o banco não retornar nenhum
  private desafiosPadrao(): Desafio[] {
    return [
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
  }

  // ---------------------------------------------------------------------------
  // CARGA DE DADOS
  // ---------------------------------------------------------------------------

  // A guilda do usuário precisa ser carregada primeiro: todo o resto depende dela.
  // Sem guilda, só carrega o que a tela de ingresso precisa (convites e lista de guildas).
  async carregarDadosBanco(): Promise<void> {
    try {
      await this.carregarMinhaGuilda();

      if (this.minhaGuildaId) {
        await Promise.all([
          this.carregarDesafios(),
          this.carregarMembros(),
          this.carregarFeed(),
          this.carregarSolicitacoes()
        ]);
      } else {
        this.limparDadosGuilda();
        await Promise.all([
          this.carregarSolicitacoes(),
          this.buscarGuildas()
        ]);
      }
    } finally {
      this.carregando = false;
    }
  }

  // Zera tudo que pertence a uma guilda (usado ao sair ou quando não há guilda)
  private limparDadosGuilda(): void {
    this.feedAtividades = [];
    this.desafios = [];
    this.membros = [];
    this.rankingGuilda = [];
    this.usuariosBusca = [];
    this.desafioSelecionado = null;
    this.segmentoSelecionado = 'feed';
  }

  private async obterUserId(): Promise<string | undefined> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.user.id;
  }

  async carregarMinhaGuilda(): Promise<void> {
    try {
      const userId = await this.obterUserId();
      if (!userId) {
        this.minhaGuildaId = null;
        this.minhaGuildaNome = '';
        this.souCriador = false;
        return;
      }

      const { data, error } = await this.supabase
        .from('guilda_membros')
        .select('guilda_id, papel, guildas(nome)')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar guilda do usuário:', error);
        return;
      }

      this.minhaGuildaId = data?.guilda_id ?? null;
      this.souCriador = data?.papel === 'criador';
      this.minhaGuildaNome = (data as any)?.guildas?.nome || '';
    } catch (e) {
      console.error('Erro de conexão ao carregar guilda:', e);
    }
  }

  // Feed com usuários reais da guilda do usuário atual
  async carregarFeed(): Promise<void> {
    if (!this.minhaGuildaId) {
      this.feedAtividades = [];
      return;
    }

    try {
      const { data, error } = await this.supabase
        .from('feed_guilda')
        .select('acao, created_at, profiles(nickname, avatar_url)')
        .eq('guilda_id', this.minhaGuildaId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao carregar feed:', error);
        return;
      }

      this.feedAtividades = (data || []).map((f: any) => ({
        usuario: f.profiles?.nickname || 'Alquimista Anônimo',
        acao: f.acao,
        tempo: this.tempoRelativo(f.created_at),
        avatar: f.profiles?.avatar_url || this.avatarPadrao
      }));
    } catch (e) {
      console.error('Erro de conexão ao carregar feed:', e);
    }
  }

  async carregarDesafios(): Promise<void> {
    if (!this.minhaGuildaId) {
      this.desafios = [];
      return;
    }

    try {
      const userId = await this.obterUserId();

      // Desafios da própria guilda + desafios globais (sem guilda_id)
      const { data: dbDesafios, error: errDesafios } = await this.supabase
        .from('guilda_desafios')
        .select('*, guilda_etapas(*)')
        .or(`guilda_id.eq.${this.minhaGuildaId},guilda_id.is.null`)
        .order('id', { ascending: true });

      if (errDesafios) {
        console.error('Erro ao carregar desafios:', errDesafios);
        return;
      }

      if (!dbDesafios || dbDesafios.length === 0) {
        this.desafios = this.desafiosPadrao();
        return;
      }

      let etapasConcluidas = new Set<number>();
      if (userId) {
        const { data: dbEtapasUsuario } = await this.supabase
          .from('guilda_usuario_etapas')
          .select('etapa_id')
          .eq('user_id', userId)
          .eq('concluida', true);

        (dbEtapasUsuario || []).forEach((item: any) => etapasConcluidas.add(item.etapa_id));
      }

      this.desafios = dbDesafios.map((d: any) => {
        const etapas = (d.guilda_etapas || [])
          .sort((a: any, b: any) => a.ordem - b.ordem)
          .map((e: any) => ({
            id: e.id,
            descricao: e.descricao,
            concluida: etapasConcluidas.has(e.id)
          }));

        const concluidasQtd = etapas.filter((e: any) => e.concluida).length;
        const progressoTotal = etapas.length > 0 ? etapas.length : d.progresso_total;

        return {
          id: d.id,
          titulo: d.titulo,
          descricao: d.descricao,
          progressoAtual: Math.min(concluidasQtd, progressoTotal),
          progressoTotal: progressoTotal,
          icone: d.icone || 'flask-outline',
          corIcone: d.cor_icone || '#a855f7',
          etapas
        };
      });
    } catch (e) {
      console.error('Erro ao carregar desafios do Supabase:', e);
    }
  }

  // Membros da guilda (via RPC listar_membros_guilda) e ranking por XP
  async carregarMembros(): Promise<void> {
    if (!this.minhaGuildaId) {
      this.membros = [];
      this.rankingGuilda = [];
      return;
    }

    try {
      const { data, error } = await this.supabase.rpc('listar_membros_guilda');

      if (error) {
        console.error('Erro ao carregar membros:', error);
        return;
      }

      this.membros = (data || []).map((m: any) => ({
        userId: m.user_id,
        nickname: m.nickname || 'Alquimista Anônimo',
        avatar: m.avatar_url || this.avatarPadrao,
        xp: Number(m.xp) || 0,
        papel: m.papel,
        entrouEm: m.entrou_em
      }));

      this.rankingGuilda = [...this.membros]
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 20)
        .map((m, index) => ({
          posicao: index + 1,
          nome: m.nickname,
          xp: `${m.xp} XP`,
          avatar: m.avatar
        }));
    } catch (e) {
      console.error('Erro de conexão ao carregar membros:', e);
    }
  }

  // Pedidos recebidos (se criador) + convites recebidos (qualquer usuário)
  async carregarSolicitacoes(): Promise<void> {
    try {
      const userId = await this.obterUserId();
      if (!userId) return;

      const { data, error } = await this.supabase
        .from('guilda_solicitacoes')
        .select('id, tipo, user_id, guilda_id, guildas(nome), solicitante:profiles!user_id(nickname)')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar solicitações:', error);
        return;
      }

      this.solicitacoes = (data || [])
        .filter((s: any) =>
          (s.tipo === 'pedido' && this.souCriador && s.guilda_id === this.minhaGuildaId) ||
          (s.tipo === 'convite' && s.user_id === userId)
        )
        .map((s: any) => ({
          id: s.id,
          tipo: s.tipo,
          nome: s.solicitante?.nickname || 'Alquimista',
          guilda: s.guildas?.nome || ''
        }));
    } catch (e) {
      console.error('Erro de conexão ao carregar solicitações:', e);
    }
  }

  // ---------------------------------------------------------------------------
  // INGRESSO EM GUILDAS (somente quem ainda não tem guilda)
  // ---------------------------------------------------------------------------

  // Sem termo (ou com menos de 2 letras) lista as guildas mais recentes,
  // para o usuário poder navegar e pedir entrada sem precisar digitar.
  async buscarGuildas(event?: any): Promise<void> {
    const termo = (event?.detail?.value ?? '').toString().trim();

    let consulta = this.supabase
      .from('guildas')
      .select('id, nome, descricao')
      .order('created_at', { ascending: false })
      .limit(20);

    if (termo.length >= 2) {
      consulta = consulta.ilike('nome', `%${termo}%`);
    }

    const { data, error } = await consulta;

    if (error) {
      console.error('Erro ao buscar guildas:', error);
      return;
    }
    this.guildasBusca = data || [];
  }

  async pedirEntrada(guildaId: string): Promise<void> {
    if (this.minhaGuildaId) {
      await this.mostrarAviso('Você já faz parte de uma guilda. Saia dela antes de pedir entrada em outra.');
      return;
    }

    const userId = await this.obterUserId();
    if (!userId) return;

    const { error } = await this.supabase.from('guilda_solicitacoes').insert({
      guilda_id: guildaId,
      user_id: userId,
      tipo: 'pedido',
      criado_por: userId
    });

    if (error) {
      // 23505 = violação do índice único de pedido pendente
      const mensagem = error.code === '23505'
        ? 'Você já tem um pedido pendente para esta guilda.'
        : 'Não foi possível enviar o pedido. Tente novamente.';
      if (error.code === '23505') this.pedidosEnviados.add(guildaId);
      await this.mostrarAviso(mensagem);
      return;
    }

    this.pedidosEnviados.add(guildaId);
    await this.mostrarAviso('Pedido enviado ao criador da guilda!');
  }

  async abrirCriarGuilda(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Criar guilda',
      inputs: [
        { name: 'nome', type: 'text', placeholder: 'Nome da guilda' },
        { name: 'descricao', type: 'textarea', placeholder: 'Descrição (opcional)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Criar',
          handler: (valores: { nome: string; descricao: string }) => {
            const nome = (valores.nome || '').trim();
            if (nome.length < 3) {
              this.mostrarAviso('O nome precisa ter pelo menos 3 caracteres.');
              return false;
            }
            this.criarGuilda(nome, (valores.descricao || '').trim());
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async criarGuilda(nome: string, descricao: string): Promise<void> {
    const { error } = await this.supabase.rpc('criar_guilda', {
      p_nome: nome,
      p_descricao: descricao
    });

    if (error) {
      await this.mostrarAviso(
        error.message.includes('duplicate') ? 'Já existe uma guilda com esse nome.' : error.message
      );
      return;
    }
    await this.carregarDadosBanco();
  }

  // ---------------------------------------------------------------------------
  // GESTÃO DA GUILDA
  // ---------------------------------------------------------------------------

  // Criador: busca usuários por nickname para convidar (ignora quem já está em uma guilda)
  async buscarUsuarios(event?: any): Promise<void> {
    const termo = (event?.detail?.value ?? '').toString().trim();
    if (termo.length < 2) {
      this.usuariosBusca = [];
      return;
    }

    const userId = await this.obterUserId();
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, nickname')
      .ilike('nickname', `%${termo}%`)
      .neq('id', userId ?? '')
      .limit(10);

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return;
    }

    const encontrados = data || [];
    const ids = encontrados.map((u: any) => u.id);

    // Filtra quem já pertence a alguma guilda (se a policy não permitir ver, o filtro é ignorado)
    let ocupados = new Set<string>();
    if (ids.length > 0) {
      const { data: emGuilda } = await this.supabase
        .from('guilda_membros')
        .select('user_id')
        .in('user_id', ids);
      (emGuilda || []).forEach((m: any) => ocupados.add(m.user_id));
    }

    this.usuariosBusca = encontrados.filter((u: any) => !ocupados.has(u.id));
  }

  async convidar(convidadoId: string): Promise<void> {
    const userId = await this.obterUserId();
    if (!userId || !this.minhaGuildaId) return;

    const { error } = await this.supabase.from('guilda_solicitacoes').insert({
      guilda_id: this.minhaGuildaId,
      user_id: convidadoId,
      tipo: 'convite',
      criado_por: userId
    });

    if (error) {
      await this.mostrarAviso(
        error.code === '23505'
          ? 'Esse usuário já tem um convite pendente.'
          : 'Não foi possível enviar o convite. Tente novamente.'
      );
      return;
    }

    this.usuariosBusca = this.usuariosBusca.filter(u => u.id !== convidadoId);
    await this.mostrarAviso('Convite enviado!');
  }

  async responder(s: Solicitacao, aceitar: boolean): Promise<void> {
    const { error } = await this.supabase.rpc('responder_solicitacao', {
      p_id: s.id,
      p_aceitar: aceitar
    });

    if (error) {
      await this.mostrarAviso(error.message);
      return;
    }
    await this.carregarDadosBanco();
  }

  // Criador: remove um membro da guilda
  async removerMembro(membro: Membro): Promise<void> {
    if (!this.souCriador || membro.papel === 'criador') return;

    const confirmado = await this.confirmar(
      'Remover membro',
      `Deseja remover ${membro.nickname} da guilda?`,
      'Remover'
    );
    if (!confirmado) return;

    const { error } = await this.supabase.rpc('remover_membro', {
      p_user_id: membro.userId
    });

    if (error) {
      await this.mostrarAviso(error.message);
      return;
    }
    await this.carregarDadosBanco();
  }

  // Qualquer membro: sai da guilda atual e fica livre para entrar ou criar outra
  async sairDaGuilda(): Promise<void> {
    let mensagem = 'Tem certeza de que deseja sair da guilda?';

    if (this.souCriador) {
      mensagem = this.membros.length > 1
        ? 'Você é o criador. Ao sair, a liderança passará ao membro mais antigo da guilda. Deseja sair?'
        : 'Você é o único membro. Ao sair, a guilda será excluída. Deseja continuar?';
    }

    const confirmado = await this.confirmar('Sair da guilda', mensagem, 'Sair');
    if (!confirmado) return;

    const { error } = await this.supabase.rpc('sair_da_guilda');

    if (error) {
      await this.mostrarAviso(error.message);
      return;
    }

    this.pedidosEnviados.clear();
    await this.carregarDadosBanco();
    await this.mostrarAviso('Você saiu da guilda. Agora pode entrar em outra ou criar a sua.');
  }

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  segmentChanged(event: any): void {
    this.segmentoSelecionado = event.detail.value;
  }

  verDesafio(desafioId: number): void {
    const desafio = this.desafios.find(d => d.id === desafioId);
    if (desafio) {
      this.desafioSelecionado = desafio;
    }
  }

  fecharDetalhes(): void {
    this.desafioSelecionado = null;
  }

  progressoPercentual(desafio: Desafio): number {
    if (desafio.progressoTotal <= 0) return 0;
    return Math.min(
      100,
      Math.round((desafio.progressoAtual / desafio.progressoTotal) * 100)
    );
  }

  tempoRelativo(iso: string): string {
    const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 1) return 'agora';
    if (min < 60) return `${min}min`;
    if (min < 1440) return `${Math.floor(min / 60)}h`;
    return `${Math.floor(min / 1440)}d`;
  }

  formatarData(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  // Se a imagem do avatar não carregar, usa o avatar padrão
  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith(this.avatarPadrao)) {
      img.src = this.avatarPadrao;
    }
  }

  // Registra uma atividade do usuário no feed da guilda
  private async registrarNoFeed(acao: string): Promise<void> {
    if (!this.minhaGuildaId) return;
    const userId = await this.obterUserId();
    if (!userId) return;

    const { error } = await this.supabase.from('feed_guilda').insert({
      user_id: userId,
      guilda_id: this.minhaGuildaId,
      acao
    });
    if (error) {
      console.error('Erro ao registrar no feed:', error);
      return;
    }
    await this.carregarFeed();
  }

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

      if (etapa.id) {
        const userId = await this.obterUserId();
        if (userId) {
          await this.supabase.from('guilda_usuario_etapas').upsert(
            { user_id: userId, etapa_id: etapa.id, concluida: true },
            { onConflict: 'user_id,etapa_id' }
          );
        }
      }

      // Alimenta o feed da guilda
      if (desafio.progressoAtual >= desafio.progressoTotal) {
        await this.registrarNoFeed(`Concluiu o desafio "${desafio.titulo}"`);
      } else {
        await this.registrarNoFeed(`Avançou em "${desafio.titulo}"`);
      }
    } else if (!concluida && etapa.concluida) {
      etapa.concluida = false;
      desafio.progressoAtual = Math.max(0, desafio.progressoAtual - 1);

      if (etapa.id) {
        const userId = await this.obterUserId();
        if (userId) {
          await this.supabase
            .from('guilda_usuario_etapas')
            .delete()
            .eq('user_id', userId)
            .eq('etapa_id', etapa.id);
        }
      }
    }
  }

  private async mostrarAviso(message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Guilda',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Alerta de confirmação: retorna true somente se o usuário tocar no botão de confirmar
  private async confirmar(header: string, message: string, textoConfirmar: string): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: textoConfirmar, role: 'confirm' }
      ]
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  voltar(): void {
    this.navCtrl.navigateBack('/tabs/tab2');
  }
}