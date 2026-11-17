import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: false
})
export class Tab5Page implements OnInit, OnDestroy {

  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  usuario = {
    nickname: 'Nickname',
    email: '',
    avatar: 'assets/perfil.png',
    nivel: 1,
    xpAtual: 0,
    xpTotal: 1000,
    ofensiva: 0,
    guilda: 'Guilda dos Alquimistas',
    plano: 'gratis' as 'gratis' | 'premium',
    planoPeriodo: null as 'mensal' | 'anual' | null,
    planoExpiraEm: null as string | null
  };

  materiaPrestigio = {
    nome: 'Nenhuma ainda',
    nivel: 1,
    progresso: 0,
    cor: '#6366f1',
    acertos: 0
  };

  tempoMedioEstudo = { horas: '0', minutos: '00' };
  principalConquista = { nome: 'Nenhuma conquista ainda' };

  private readonly ACERTOS_POR_NIVEL_MATERIA = 10;
  private readonly DIAS_MEDIA_ESTUDO = 30;
  private listenerPerfil: any;

  // ========================================================
  // CONTROLE DO MODAL DE PAGAMENTO / ASSINATURA PREMIUM
  // ========================================================
  modalPagamentoAberto: boolean = false;
  planoEscolhido: 'mensal' | 'anual' = 'mensal';
  metodoPagamento: 'pix' | 'cartao' = 'pix';
  processandoPagamento: boolean = false;

  dadosCartao = {
    numero: '4532 •••• •••• 8910',
    nome: 'ALQUIMISTA ESTUDANTE',
    validade: '12/29',
    cvv: '789'
  };

  readonly pixChaveCopiaCola: string = '00020126580014br.gov.bcb.pix0136brio-alquimia-studios-premium52040000530398654049.905802BR5925BRIO EDUCACAO ALQUIMICA6009SAO PAULO62070503***6304E2D1';

  get progressoXp(): number {
    if (!this.usuario.xpTotal || this.usuario.xpTotal <= 0) return 0;
    return Math.min(1, this.usuario.xpAtual / this.usuario.xpTotal);
  }

  get porcentagemMateria(): number {
    return Math.round(this.materiaPrestigio.progresso * 100);
  }

  get valorPlanoEscolhido(): string {
    return this.planoEscolhido === 'mensal' ? 'R$ 9,90' : 'R$ 79,90';
  }

  get dataExpiracaoFormatada(): string {
    if (!this.usuario.planoExpiraEm) return '';
    try {
      const d = new Date(this.usuario.planoExpiraEm);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  }

  constructor(
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    // Escuta o evento emitido no momento em que a alteração de perfil é salva
    this.listenerPerfil = (event: CustomEvent) => {
      this.ngZone.run(() => {
        if (event.detail?.nickname) this.usuario.nickname = event.detail.nickname;
        if (event.detail?.avatar) this.usuario.avatar = event.detail.avatar;
        if (event.detail?.plano) this.usuario.plano = event.detail.plano;
        if (event.detail?.planoPeriodo) this.usuario.planoPeriodo = event.detail.planoPeriodo;
        if (event.detail?.planoExpiraEm) this.usuario.planoExpiraEm = event.detail.planoExpiraEm;
        this.cdr.detectChanges();
      });
    };
    window.addEventListener('perfil-atualizado', this.listenerPerfil as EventListener);
  }

  ngOnDestroy() {
    if (this.listenerPerfil) {
      window.removeEventListener('perfil-atualizado', this.listenerPerfil as EventListener);
    }
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  async carregarDados() {
    // 1. Atualização instantânea pelo localStorage
    this.ngZone.run(() => {
      const nickSalvo = localStorage.getItem('app_user_nickname');
      const avatarSalvo = localStorage.getItem('app_user_avatar');
      const planoSalvo = localStorage.getItem('app_user_plano');
      if (nickSalvo) this.usuario.nickname = nickSalvo;
      if (avatarSalvo) this.usuario.avatar = avatarSalvo;
      if (planoSalvo === 'premium') this.usuario.plano = 'premium';
      this.cdr.detectChanges();
    });

    // 2. Sincronização com o banco de dados Supabase
    try {
      const { data: sess } = await this.supabase.auth.getSession();
      const user = sess.session?.user;
      if (!user) return;

      if (user.email) this.usuario.email = user.email;

      await Promise.all([
        this.carregarPerfilUsuario(user.id),
        this.carregarTempoMedioEstudo(user.id),
        this.carregarPrincipalConquista(user.id),
        this.carregarMateriaPrestigio(user.id)
      ]);

      this.ngZone.run(() => this.cdr.detectChanges());
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
    }
  }

  private async carregarPerfilUsuario(userId: string) {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('nickname, email, avatar_url, nivel, xp, ofensiva_dias, plano, plano_periodo, plano_expira_em')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) return;

    if (profile.nickname) this.usuario.nickname = profile.nickname;
    if (profile.email) this.usuario.email = profile.email;
    if (profile.avatar_url) this.usuario.avatar = profile.avatar_url;

    this.usuario.nivel = profile.nivel ?? 1;
    this.usuario.xpAtual = profile.xp ?? 0;
    this.usuario.ofensiva = profile.ofensiva_dias ?? 0;
    this.usuario.xpTotal = this.usuario.nivel * 1000;

    // Dados de Assinatura / Plano
    this.usuario.plano = profile.plano === 'premium' ? 'premium' : 'gratis';
    this.usuario.planoPeriodo = profile.plano_periodo || null;
    this.usuario.planoExpiraEm = profile.plano_expira_em || null;

    if (profile.nickname) localStorage.setItem('app_user_nickname', profile.nickname);
    if (profile.avatar_url) localStorage.setItem('app_user_avatar', profile.avatar_url);
    localStorage.setItem('app_user_plano', this.usuario.plano);
  }

  private async carregarTempoMedioEstudo(userId: string) {
    const desde = new Date();
    desde.setDate(desde.getDate() - this.DIAS_MEDIA_ESTUDO);

    const { data, error } = await this.supabase
      .from('sessoes_pomodoro')
      .select('duracao_minutos, inicio')
      .eq('user_id', userId)
      .gte('inicio', desde.toISOString());

    if (error || !data || data.length === 0) {
      this.tempoMedioEstudo = { horas: '0', minutos: '00' };
      return;
    }

    const minutosPorDia = new Map<string, number>();
    for (const s of data) {
      const dia = new Date(s.inicio).toLocaleDateString('en-CA');
      minutosPorDia.set(dia, (minutosPorDia.get(dia) || 0) + (s.duracao_minutos || 0));
    }

    const total = Array.from(minutosPorDia.values()).reduce((a, b) => a + b, 0);
    const media = Math.round(total / minutosPorDia.size);

    const h = Math.floor(media / 60);
    const m = media % 60;
    this.tempoMedioEstudo = {
      horas: String(h),
      minutos: m < 10 ? `0${m}` : String(m)
    };
  }

  private async carregarPrincipalConquista(userId: string) {
    const { data, error } = await this.supabase
      .from('runas_usuario')
      .select('desbloqueada_em, runas(*)')
      .eq('user_id', userId)
      .order('desbloqueada_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      this.principalConquista.nome = 'Nenhuma conquista ainda';
      return;
    }

    const runa: any = (data as any).runas;
    const nome = runa?.nome ?? runa?.titulo ?? runa?.name;
    if (nome) this.principalConquista.nome = nome;
  }

  private async carregarMateriaPrestigio(userId: string) {
    const { data, error } = await this.supabase
      .from('historico_quizzes')
      .select('materia_id, materias(nome, cor_hex)')
      .eq('user_id', userId)
      .eq('acertou', true)
      .not('materia_id', 'is', null);

    if (error || !data || data.length === 0) {
      this.materiaPrestigio = {
        nome: 'Nenhuma ainda', nivel: 1, progresso: 0, cor: '#6366f1', acertos: 0
      };
      return;
    }

    const contagem = new Map<string, { nome: string; cor: string; acertos: number }>();
    for (const row of data as any[]) {
      const atual = contagem.get(row.materia_id) || {
        nome: row.materias?.nome || 'Matéria',
        cor: row.materias?.cor_hex || '#6366f1',
        acertos: 0
      };
      atual.acertos++;
      contagem.set(row.materia_id, atual);
    }

    const top = Array.from(contagem.values()).sort((a, b) => b.acertos - a.acertos)[0];
    const por = this.ACERTOS_POR_NIVEL_MATERIA;

    this.materiaPrestigio = {
      nome: top.nome,
      cor: top.cor,
      acertos: top.acertos,
      nivel: Math.floor(top.acertos / por) + 1,
      progresso: (top.acertos % por) / por
    };
  }

  alterarPerfil() {
    this.navCtrl.navigateForward('/editar-perfil');
  }

  // ====================================================================
  // FLUXO DE PAGAMENTO E UPGRADE PARA PLANO PREMIUM
  // ====================================================================
  abrirModalPagamento(periodo: 'mensal' | 'anual') {
    this.planoEscolhido = periodo;
    this.modalPagamentoAberto = true;
  }

  fecharModalPagamento() {
    if (this.processandoPagamento) return;
    this.modalPagamentoAberto = false;
  }

  async copiarPix() {
    try {
      await navigator.clipboard.writeText(this.pixChaveCopiaCola);
      const toast = await this.toastCtrl.create({
        message: 'Código PIX copiado com sucesso!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    } catch {
      // fallback
    }
  }

  async efetuarPagamento() {
    this.processandoPagamento = true;

    try {
      const { data: sess } = await this.supabase.auth.getSession();
      const userId = sess.session?.user.id;

      if (!userId) {
        throw new Error('Usuário precisa estar autenticado para assinar.');
      }

      // Calcula a data de expiração da assinatura
      const dias = this.planoEscolhido === 'anual' ? 365 : 30;
      const dataExpira = new Date();
      dataExpira.setDate(dataExpira.getDate() + dias);
      const dataExpiraStr = dataExpira.toISOString();

      console.log(`Processando pagamento para ${this.planoEscolhido}...`);

      // 1. Tenta atualizar usando RPC assinar_plano_premium (caso o trigger bloqueie update direto)
      let atualizado = false;
      try {
        const { error: rpcError } = await this.supabase.rpc('assinar_plano_premium', {
          p_periodo: this.planoEscolhido,
          p_dias: dias
        });

        if (!rpcError) {
          atualizado = true;
          console.log('✅ Plano atualizado com sucesso via RPC assinar_plano_premium!');
        } else {
          console.warn('RPC não encontrada ou falhou, tentando update direto na tabela profiles:', rpcError.message);
        }
      } catch (e) {
        console.warn('Erro ao chamar RPC:', e);
      }

      // 2. Se a RPC não estiver disponível, tenta update direto no profiles
      if (!atualizado) {
        const { error: updateError } = await this.supabase
          .from('profiles')
          .update({
            plano: 'premium',
            plano_periodo: this.planoEscolhido,
            plano_expira_em: dataExpiraStr,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Erro no update de profiles:', updateError);
          // Se for erro do trigger bloquear_alteracao_plano, avisa claramente
          if (updateError.message?.includes('bloquear') || updateError.message?.includes('plano')) {
            console.warn('Trigger trg_bloquear_plano bloqueou o update direto.');
          }
          throw updateError;
        }
      }

      // 3. Atualiza os dados locais do componente
      this.usuario.plano = 'premium';
      this.usuario.planoPeriodo = this.planoEscolhido;
      this.usuario.planoExpiraEm = dataExpiraStr;

      localStorage.setItem('app_user_plano', 'premium');

      // Notifica todos os componentes abertos
      window.dispatchEvent(new CustomEvent('perfil-atualizado', {
        detail: {
          nickname: this.usuario.nickname,
          avatar: this.usuario.avatar,
          plano: 'premium',
          planoPeriodo: this.planoEscolhido,
          planoExpiraEm: dataExpiraStr
        }
      }));

      this.modalPagamentoAberto = false;

      // Alerta de boas-vindas comemorativo
      const alert = await this.alertCtrl.create({
        header: '🎉 Alquimista Premium Ativado!',
        subHeader: `Plano ${this.planoEscolhido === 'mensal' ? 'Mensal' : 'Anual'} ativado com sucesso!`,
        message: 'Todas as vantagens exclusivas foram liberadas na sua conta:\n\n✨ Quizzes Ilimitados sem limites diários\n🎭 Todos os Avatares Lendários liberados\n📊 Diagnósticos e Relatórios Semanais de IA!',
        buttons: ['Começar a Usar']
      });
      await alert.present();

    } catch (err: any) {
      console.error('Erro ao efetuar pagamento:', err);
      const toast = await this.toastCtrl.create({
        message: 'Erro ao processar assinatura: ' + (err.message || 'Verifique sua conexão.'),
        duration: 3500,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.processandoPagamento = false;
      this.cdr.detectChanges();
    }
  }

  // Permite ao usuário cancelar ou testar alternância de plano
  async gerenciarAssinatura() {
    const alert = await this.alertCtrl.create({
      header: 'Assinatura Premium ⭐',
      message: `Você é um membro Premium ativo (${this.usuario.planoPeriodo?.toUpperCase() || 'MENSAL'}).\n\nSua assinatura é válida até ${this.dataExpiracaoFormatada}.`,
      buttons: [
        { text: 'Manter Assinatura', role: 'cancel' },
        {
          text: 'Cancelar Plano',
          role: 'destructive',
          handler: async () => {
            await this.cancelarAssinatura();
          }
        }
      ]
    });
    await alert.present();
  }

  private async cancelarAssinatura() {
    try {
      const { data: sess } = await this.supabase.auth.getSession();
      const userId = sess.session?.user.id;
      if (!userId) return;

      await this.supabase
        .from('profiles')
        .update({
          plano: 'gratis',
          plano_periodo: null,
          plano_expira_em: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      this.usuario.plano = 'gratis';
      this.usuario.planoPeriodo = null;
      this.usuario.planoExpiraEm = null;
      localStorage.setItem('app_user_plano', 'gratis');

      window.dispatchEvent(new CustomEvent('perfil-atualizado', {
        detail: { plano: 'gratis' }
      }));

      const toast = await this.toastCtrl.create({
        message: 'Plano alterado para Gratuito.',
        duration: 2000,
        color: 'medium',
        position: 'bottom'
      });
      await toast.present();
      this.cdr.detectChanges();
    } catch (e) {
      console.error(e);
    }
  }
}
