import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

type Unidade = 'horas' | 'sessoes' | 'dias';

interface Runa {
  id: number;
  nome: string;
  descricao: string;
  dica: string;
  icone: string;
  desbloqueada: boolean;
  nova: boolean;       // conquistada e ainda não vista
  valor: number;       // progresso já convertido (horas, sessões ou dias)
  meta: number;        // idem
  unidade: Unidade;
}

@Component({
  selector: 'app-grim1',
  templateUrl: './grim1.page.html',
  styleUrls: ['./grim1.page.scss'],
  standalone: false
})
export class Grim1Page {
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  paginaAtual: number = 0;
  itensPorPagina: number = 5;
  folhaVirando: boolean = false;
  animando: boolean = false;

  todasRunas: Runa[] = [];
  carregando = true;
  erro = false;

  constructor(
    private navCtrl: NavController,
    private toast: ToastController
  ) {}

  async ionViewWillEnter() {
    await this.carregar();
  }

  // =====================================================
  // Dados
  // =====================================================
  async carregar() {
    try {
      this.carregando = true;
      this.erro = false;

      const { data: sess, error: authError } = await this.supabase.auth.getSession();
      const userId = sess.session?.user.id;
      if (authError || !userId) throw authError ?? new Error('Não autenticado');

      const aval = await this.supabase.rpc('avaliar_minhas_runas');
      if (aval.error) console.error('avaliar_minhas_runas', aval.error);

      const [runasRes, minhasRes, progRes] = await Promise.all([
        this.supabase
          .from('runas')
          .select('id, nome, descricao, dica, icone, criterio, meta')
          .eq('ativa', true)
          .order('ordem'),
        this.supabase.from('runas_usuario').select('runa_id, vista').eq('user_id', userId),
        this.supabase.rpc('progresso_runas'),
      ]);

      if (runasRes.error) throw runasRes.error;
      if (minhasRes.error) throw minhasRes.error;
      if (progRes.error) throw progRes.error;

      const minhas = new Map<number, boolean>();
      (minhasRes.data ?? []).forEach((m: any) => minhas.set(m.runa_id, !!m.vista));

      const progresso = new Map<number, number>();
      (progRes.data ?? []).forEach((p: any) => progresso.set(p.runa_id, p.valor));

      this.todasRunas = (runasRes.data ?? []).map((r: any): Runa => {
        const desbloqueada = minhas.has(r.id);
        const unidade = this.unidadePorCriterio(r.criterio);

        // Converte minutos para horas inteiras completas (Math.floor)
        const converter = (n: number) => (unidade === 'horas' ? Math.floor(n / 60) : n);

        const meta = converter(r.meta);
        const bruto = desbloqueada ? r.meta : progresso.get(r.id) ?? 0;
        const valor = Math.min(converter(bruto), meta);

        return {
          id: r.id,
          nome: r.nome,
          descricao: r.descricao,
          dica: r.dica,
          icone: r.icone,
          desbloqueada,
          nova: desbloqueada && minhas.get(r.id) === false,
          valor,
          meta,
          unidade,
        };
      });

      this.paginaAtual = Math.min(this.paginaAtual, Math.max(this.totalPaginas - 1, 0));

      const novas = this.todasRunas.filter((r) => r.nova);
      if (novas.length > 0) {
        this.avisar(
          novas.length === 1
            ? `Nova runa desbloqueada: ${novas[0].nome}!`
            : `${novas.length} novas runas desbloqueadas!`
        );
        this.supabase.rpc('marcar_runas_vistas').then(({ error }) => {
          if (error) console.error('marcar_runas_vistas', error);
        });
      }
    } catch (e) {
      console.error('Erro ao carregar runas', e);
      this.erro = true;
    } finally {
      this.carregando = false;
    }
  }

  get runasPaginaAtual(): Runa[] {
    const inicio = this.paginaAtual * this.itensPorPagina;
    return this.todasRunas.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.todasRunas.length / this.itensPorPagina);
  }

  get totalDesbloqueadas(): number {
    return this.todasRunas.filter((r) => r.desbloqueada).length;
  }

  // =====================================================
  // Progresso / unidades
  // =====================================================
  private unidadePorCriterio(criterio: string): Unidade {
    switch (criterio) {
      case 'minutos_no_dia':
      case 'minutos_total':
        return 'horas';
      case 'streak_dias':
      case 'dias_ativos':
        return 'dias';
      default:
        return 'sessoes';
    }
  }

  /** "0/3h", "10/20h", "1/7 dias", "0/5 sessões" */
  rotuloProgresso(r: Runa): string {
    switch (r.unidade) {
      case 'horas':
        return `${this.fmtHoras(r.valor)}/${this.fmtHoras(r.meta)}h`;
      case 'dias':
        return `${r.valor}/${r.meta} dias`;
      default:
        return `${r.valor}/${r.meta} sessões`;
    }
  }

  /** Exibe horas inteiras sem decimais */
  private fmtHoras(h: number): string {
    if (h <= 0) return '0';
    return String(Math.floor(h));
  }

  percentual(r: Runa): number {
    return r.meta > 0 ? Math.min(Math.round((r.valor / r.meta) * 100), 100) : 0;
  }

  // =====================================================
  // Virada de página
  // =====================================================
  proximaPagina() {
    if (this.paginaAtual < this.totalPaginas - 1 && !this.animando) {
      this.animando = true;
      this.folhaVirando = true;

      setTimeout(() => {
        this.paginaAtual++;
      }, 300);

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

  private async avisar(message: string) {
    const t = await this.toast.create({ message, duration: 2600, position: 'top' });
    await t.present();
  }
}