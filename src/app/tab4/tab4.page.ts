import { Component, ElementRef, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// Ajuste para onde ficam suas chaves do Supabase:
import { environment } from '../../environments/environment';

interface Nivel {
  id: number;
  nome: string;
  xp_minimo: number;
}

interface Recompensa {
  id: string;
  nivel_requerido: number;
  titulo: string;
  descricao: string | null;
  imagem: string;
  raridade: string;
  ordem: number;
}

interface RecompensaView extends Recompensa {
  desbloqueada: boolean;
  coletada: boolean;
  coletadaEm: string | null;
  xpFaltante: number; // XP que falta para o nível que libera a recompensa
  misteriosa: boolean; // 2+ níveis à frente: aparece como "???"
}

interface BarraGrafico {
  rotulo: string;
  minutos: number;
  altura: number; // 0-100
  hoje: boolean;
}

interface Particula {
  dx: string;
  dy: string;
  delay: string;
  cor: string;
}

function gerarParticulas(qtd: number, base: number): Particula[] {
  const cores = ['#ffc857', '#e599f7', '#c77dff', '#ffffff'];
  return Array.from({ length: qtd }, (_, i) => {
    const ang = (i / qtd) * Math.PI * 2;
    const dist = base + (i % 3) * (base * 0.35);
    return {
      dx: `${Math.round(Math.cos(ang) * dist)}px`,
      dy: `${Math.round(Math.sin(ang) * dist)}px`,
      delay: `${(i % 4) * 0.06}s`,
      cor: cores[i % cores.length],
    };
  });
}

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: false,
})
export class Tab4Page {
  // Se você já usa um client compartilhado em outras abas, troque esta linha por ele.
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  // ---- dados base ----
  private niveis: Nivel[] = [];
  private todas: RecompensaView[] = [];
  nivelAtual = 1;
  xpAtual = 0;

  // ---- cabeçalho / maestria ----
  nivelNome = '';
  maestriaPercent = 0;
  maestriaFim = 0;
  ticks: { pos: number; reached: boolean }[] = [];
  nomeInicio = '';
  nomeFim = '';

  // ---- recompensas (carrossel horizontal) ----
  @ViewChild('trilhoEl') trilhoEl?: ElementRef<HTMLDivElement>;
  trilho: RecompensaView[] = [];
  podeVoltar = false;
  podeAvancar = false;
  pendentes = 0;

  // ---- próxima recompensa ----
  xpFaltante = 0;
  progressoNivel = 0; // 0-100 dentro do nível atual
  nivelMaximo = false;
  proximaRecompensa?: RecompensaView;

  // ---- coleção (recompensas já coletadas) ----
  colecaoAberta = false;
  colecao: RecompensaView[] = [];
  totalRecompensas = 0;
  filtroColecao = 'todas';
  filtros = [
    { id: 'todas', nome: 'Todas' },
    { id: 'comum', nome: 'Comum' },
    { id: 'rara', nome: 'Rara' },
    { id: 'epica', nome: 'Épica' },
    { id: 'lendaria', nome: 'Lendária' },
  ];

  // ---- modal da recompensa ----
  modalAberto = false;
  recompensaSel?: RecompensaView;

  // ---- animações ----
  coletando: string | null = null;
  fxId: string | null = null;
  burst: Particula[] = gerarParticulas(10, 70);
  sparks: Particula[] = gerarParticulas(18, 120);
  levelUp = {
    aberto: false,
    nivel: 0,
    nome: '',
    novas: [] as RecompensaView[],
  };

  // ---- gráfico ----
  barras: BarraGrafico[] = [];
  totalSemana = 0;
  melhorDia = '-';
  barraSel: number | null = null;

  carregando = true;
  erro = false;

  constructor(private toast: ToastController) {}

  // Executa toda vez que a aba é aberta
  async ionViewWillEnter() {
    await this.carregar();
  }

  // =====================================================
  // Carregamento
  // =====================================================
  private async carregar() {
    try {
      this.carregando = true;
      this.erro = false;

      const { data: auth, error: authError } = await this.supabase.auth.getUser();
      if (authError || !auth.user) throw authError ?? new Error('Não autenticado');
      const userId = auth.user.id;

      const [perfilRes, niveisRes, recRes, userRecRes, sessoesRes] = await Promise.all([
        this.supabase.from('profiles').select('xp, nivel, nivel_visto').eq('id', userId).single(),
        this.supabase.from('niveis').select('*').order('id'),
        this.supabase.from('recompensas').select('*').order('ordem'),
        this.supabase
          .from('recompensas_usuario')
          .select('recompensa_id, coletada_em')
          .eq('user_id', userId),
        this.buscarSessoes(userId, 8),
      ]);

      if (perfilRes.error) throw perfilRes.error;
      if (niveisRes.error) throw niveisRes.error;
      if (recRes.error) throw recRes.error;
      if (userRecRes.error) throw userRecRes.error;
      if (sessoesRes.error) throw sessoesRes.error;

      const perfil = perfilRes.data as { xp: number; nivel: number; nivel_visto: number };
      this.niveis = (niveisRes.data ?? []) as Nivel[];
      this.nivelAtual = perfil.nivel;
      this.xpAtual = perfil.xp;

      const coletadasEm = new Map<string, string>();
      (userRecRes.data ?? []).forEach((u: any) => {
        if (u.coletada_em) coletadasEm.set(u.recompensa_id, u.coletada_em);
      });

      this.todas = ((recRes.data ?? []) as Recompensa[]).map((r) => {
        const alvo = this.niveis.find((n) => n.id === r.nivel_requerido);
        return {
          ...r,
          raridade: r.raridade ?? 'comum',
          ordem: r.ordem ?? 0,
          misteriosa: r.nivel_requerido > perfil.nivel + 1,
          desbloqueada: r.nivel_requerido <= perfil.nivel,
          coletada: coletadasEm.has(r.id),
          coletadaEm: coletadasEm.get(r.id) ?? null,
          xpFaltante: Math.max((alvo?.xp_minimo ?? 0) - perfil.xp, 0),
        };
      });

      this.montarNiveis();
      this.montarTrilho();
      this.montarProximoNivel();
      this.montarGrafico((sessoesRes.data ?? []) as any[], 8);
      setTimeout(() => this.posicionarTrilho(), 80);

      // Maestria + animação de level-up
      const finalPct = this.calcMaestria(perfil.nivel, this.progressoNivel / 100);
      this.maestriaFim = finalPct;
      const visto = perfil.nivel_visto ?? perfil.nivel;

      if (perfil.nivel > visto) {
        // barra começa no nível antigo e só avança quando o usuário fecha a animação
        this.maestriaPercent = this.calcMaestria(visto, 0);
        this.abrirLevelUp(visto);
        this.supabase.rpc('marcar_nivel_visto').then(({ error }) => {
          if (error) console.error('marcar_nivel_visto', error);
        });
      } else {
        this.maestriaPercent = finalPct;
      }
    } catch (e) {
      console.error('Erro ao carregar progresso', e);
      this.erro = true;
    } finally {
      this.carregando = false;
    }
  }

  private buscarSessoes(userId: string, dias: number) {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(inicio.getDate() - (dias - 1));

    return this.supabase
      .from('sessoes_pomodoro')
      .select('duracao_minutos, created_at')
      .eq('user_id', userId)
      .gte('created_at', inicio.toISOString());
  }

  // =====================================================
  // Montagem dos blocos da tela
  // =====================================================
  private montarNiveis() {
    this.nivelNome = this.niveis.find((n) => n.id === this.nivelAtual)?.nome ?? '';
    this.nomeInicio = this.niveis[0]?.nome ?? '';
    this.nomeFim = this.niveis[this.niveis.length - 1]?.nome ?? '';

    const total = this.niveis.length - 1;
    const idx = this.niveis.findIndex((n) => n.id === this.nivelAtual);
    this.ticks = this.niveis.map((_, i) => ({
      pos: total > 0 ? (i / total) * 100 : 0,
      reached: i <= idx,
    }));
  }

  private montarTrilho() {
    // Todas as recompensas lado a lado, na ordem dos níveis
    this.trilho = [...this.todas].sort(
      (a, b) => a.nivel_requerido - b.nivel_requerido || a.ordem - b.ordem
    );
    this.pendentes = this.todas.filter((r) => r.desbloqueada && !r.coletada).length;

    // coleção: só o que já foi coletado, da mais recente para a mais antiga
    this.totalRecompensas = this.todas.length;
    this.colecao = this.todas
      .filter((r) => r.coletada)
      .sort((a, b) => (b.coletadaEm ?? '').localeCompare(a.coletadaEm ?? ''));
  }

  private montarProximoNivel() {
    const atual = this.niveis.find((n) => n.id === this.nivelAtual);
    const proximo = this.niveis.find((n) => n.id === this.nivelAtual + 1);

    if (!proximo || !atual) {
      this.nivelMaximo = true;
      this.xpFaltante = 0;
      this.progressoNivel = 100;
      this.proximaRecompensa = undefined;
      return;
    }

    this.nivelMaximo = false;
    this.xpFaltante = Math.max(proximo.xp_minimo - this.xpAtual, 0);
    const faixa = Math.max(proximo.xp_minimo - atual.xp_minimo, 1);
    this.progressoNivel = Math.min(
      Math.max(Math.round(((this.xpAtual - atual.xp_minimo) / faixa) * 100), 0),
      100
    );
    this.proximaRecompensa = this.todas.find((r) => r.nivel_requerido === proximo.id);
  }

  /** Maestria 0-100: cada nível concluído avança um "degrau" da barra; o XP preenche o degrau atual. */
  private calcMaestria(nivelId: number, fracao: number): number {
    const total = this.niveis.length - 1;
    const idx = this.niveis.findIndex((n) => n.id === nivelId);
    if (total <= 0 || idx < 0) return 0;
    const f = idx >= total ? 0 : Math.min(Math.max(fracao, 0), 1);
    return Math.round(Math.min(((idx + f) / total) * 100, 100) * 10) / 10;
  }

  private montarGrafico(
    sessoes: { duracao_minutos: number | null; created_at: string }[],
    dias: number
  ) {
    // Chave yyyy-mm-dd no fuso do aparelho (sem depender de locale)
    const chave = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
    const nomesDia = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(inicio.getDate() - (dias - 1));

    const hojeKey = chave(new Date());
    const mapa = new Map<string, { rotulo: string; minutos: number }>();
    for (let i = 0; i < dias; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      mapa.set(chave(d), { rotulo: nomesDia[d.getDay()], minutos: 0 });
    }

    for (const s of sessoes) {
      const item = mapa.get(chave(new Date(s.created_at)));
      if (item) item.minutos += s.duracao_minutos ?? 0;
    }

    const lista = Array.from(mapa.entries());
    const max = Math.max(...lista.map(([, v]) => v.minutos), 1);

    this.barras = lista.map(([k, v]) => ({
      rotulo: v.rotulo,
      minutos: v.minutos,
      // altura mínima de 6% para a barra aparecer mesmo em dia zerado
      altura: Math.max(Math.round((v.minutos / max) * 100), 6),
      hoje: k === hojeKey,
    }));

    this.totalSemana = lista.reduce((acc, [, v]) => acc + v.minutos, 0);
    const melhor = lista.reduce((a, b) => (b[1].minutos > a[1].minutos ? b : a));
    this.melhorDia = melhor[1].minutos > 0 ? melhor[1].rotulo : '-';
    this.barraSel = null;
  }

  // =====================================================
  // Interações
  // =====================================================
  abrirRecompensa(r?: RecompensaView) {
    if (!r) return;
    this.recompensaSel = r;
    this.modalAberto = true;
  }

  abrirProxima() {
    this.abrirRecompensa(this.proximaRecompensa);
  }

  fecharModal() {
    this.modalAberto = false;
  }

  async coletar(r: RecompensaView, ev?: Event) {
    ev?.stopPropagation();
    if (!r.desbloqueada || r.coletada || this.coletando) return;

    this.coletando = r.id;
    const { error } = await this.supabase.rpc('coletar_recompensa', {
      p_recompensa_id: r.id,
    });

    if (error) {
      console.error('coletar_recompensa', error);
      this.coletando = null;
      this.avisar('Não foi possível coletar agora. Tente de novo.');
      return;
    }

    r.coletada = true;
    r.coletadaEm = new Date().toISOString();
    this.fxId = r.id;
    this.montarTrilho();

    setTimeout(() => {
      this.fxId = null;
      this.coletando = null;
    }, 1400);
  }

  abrirColecao() {
    this.filtroColecao = 'todas';
    this.colecaoAberta = true;
  }

  fecharColecao() {
    this.colecaoAberta = false;
  }

  get colecaoFiltrada(): RecompensaView[] {
    return this.filtroColecao === 'todas'
      ? this.colecao
      : this.colecao.filter((r) => r.raridade === this.filtroColecao);
  }

  formatarData(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  }

  // ---------- carrossel de recompensas ----------
  atualizarSetas() {
    const el = this.trilhoEl?.nativeElement;
    if (!el) return;
    this.podeVoltar = el.scrollLeft > 4;
    this.podeAvancar = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
  }

  rolar(direcao: -1 | 1) {
    const el = this.trilhoEl?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: direcao * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  /** Abre o carrossel já na primeira recompensa para coletar (ou na próxima a conquistar). */
  private posicionarTrilho() {
    const el = this.trilhoEl?.nativeElement;
    if (!el) return;

    let idx = this.trilho.findIndex((r) => r.desbloqueada && !r.coletada);
    if (idx < 0) idx = this.trilho.findIndex((r) => !r.desbloqueada && !r.misteriosa);
    if (idx < 0) idx = 0;

    const card = el.children[idx] as HTMLElement | undefined;
    el.scrollTo({ left: card ? Math.max(card.offsetLeft - 2, 0) : 0, behavior: 'auto' });
    this.atualizarSetas();
  }

  async recarregar() {
    await this.carregar();
  }

  /** Aceita caminho de assets (assets/x.png) ou URL completa (Supabase Storage). */
  img(caminho: string): string {
    return /^(https?:|data:)/.test(caminho) ? caminho : '../../' + caminho;
  }

  selecionarBarra(i: number) {
    this.barraSel = this.barraSel === i ? null : i;
  }

  fmtMin(m: number): string {
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r ? `${h}h ${r}min` : `${h}h`;
  }

  rotuloRaridade(r: string): string {
    const nomes: Record<string, string> = {
      comum: 'Comum',
      rara: 'Rara',
      epica: 'Épica',
      lendaria: 'Lendária',
    };
    return nomes[r] ?? r;
  }

  nomeDoNivel(id: number): string {
    return this.niveis.find((n) => n.id === id)?.nome ?? '';
  }

  // =====================================================
  // Level-up
  // =====================================================
  private abrirLevelUp(visto: number) {
    this.levelUp = {
      aberto: false,
      nivel: this.nivelAtual,
      nome: this.nivelNome,
      novas: this.todas.filter(
        (r) => r.nivel_requerido > visto && r.nivel_requerido <= this.nivelAtual
      ),
    };
    setTimeout(() => (this.levelUp.aberto = true), 450);
  }

  fecharLevelUp() {
    this.levelUp.aberto = false;
    // a barra de maestria avança depois que a animação sai de cena
    setTimeout(() => (this.maestriaPercent = this.maestriaFim), 300);
  }

  private async avisar(message: string) {
    const t = await this.toast.create({ message, duration: 2200, position: 'bottom' });
    await t.present();
  }
}