import { Component, OnDestroy, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase';

interface PerfilUsuario {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  nivel: number;
  xp: number;
  ofensiva_dias: number;
  tempo_foco_maximo_dia: number; // Recorde de foco em um dia (minutos)
  plano: string;
}

// Bloco de estudo exibido em "Estudos do dia" (mesmo formato que as tarefas fixas tinham)
interface EstudoDia {
  id: string;
  titulo: string;
  tempo: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit, OnDestroy {
  // Fuso usado para definir "o dia" (o mesmo do trigger no banco)
  private readonly FUSO_HORARIO = 'America/Sao_Paulo';
  private readonly INTERVALO_ATUALIZACAO_MS = 10000;

  // Quantos blocos aparecem em "Estudos do dia"
  private readonly LIMITE_ESTUDOS_DIA = 3;

  // Informações do perfil carregadas do Supabase
  perfil: PerfilUsuario | null = null;
  xpPorcentagem: number = 0;
  carregandoPerfil: boolean = true;

  // Foco total de HOJE (vem da tabela foco_diario)
  focoTotal: string = '0m';
  private focoInterval: ReturnType<typeof setInterval> | null = null;

  // Estudos do dia (vêm dos blocos da página grim2)
  estudosDia: EstudoDia[] = [];
  carregandoEstudos: boolean = true;

  // Contadores do card "Estudos" do resumo (concluídos / total de blocos)
  estudosConcluidos: number = 0;
  estudosTotal: number = 0;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    // Valor antigo gravado pela versão anterior do timer; era ele que deixava o card travado
    localStorage.removeItem('tempoFoco');
  }

  // Executa toda vez que a aba ganha foco no Ionic (inclusive na primeira vez)
  async ionViewWillEnter() {
    await Promise.all([
      this.carregarPerfilUsuario(),
      this.carregarFocoHoje(),
      this.carregarEstudosDoDia()
    ]);

    // Enquanto a home estiver visível, relê o total do dia periodicamente
    this.pararAtualizacao();
    this.focoInterval = setInterval(() => {
      this.carregarFocoHoje();
    }, this.INTERVALO_ATUALIZACAO_MS);
  }

  ionViewWillLeave() {
    this.pararAtualizacao();
  }

  ngOnDestroy(): void {
    this.pararAtualizacao();
  }

  private pararAtualizacao(): void {
    if (this.focoInterval !== null) {
      clearInterval(this.focoInterval);
      this.focoInterval = null;
    }
  }

  // Busca o perfil do usuário logado na tabela public.profiles
  async carregarPerfilUsuario() {
    try {
      this.carregandoPerfil = true;
      const user = await this.supabaseService.getUsuarioAtual();

      if (user) {
        const { data, error } = await this.supabaseService.client
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao carregar perfil:', error);
        } else if (data) {
          this.perfil = data;
          this.calcularProgressoXP(data.xp || 0);
        }
      }
    } catch (err) {
      console.error('Erro na requisição do perfil:', err);
    } finally {
      this.carregandoPerfil = false;
    }
  }

  // Preenche a barra de XP considerando ciclos de 100 XP por nível
  calcularProgressoXP(xpAtual: number) {
    const xpNoNivelAtual = xpAtual % 100;
    this.xpPorcentagem = Math.min(Math.max(xpNoNivelAtual, 0), 100);
  }

  // Seleciona os blocos de estudo da grim2 que aparecem na home:
  // apenas blocos NÃO concluídos (blocos_estudo.concluido = false), na ordem da grim2
  // (coluna "ordem" e depois created_at), limitados a LIMITE_ESTUDOS_DIA.
  // Também calcula o contador "concluídos/total" do resumo do dia.
  async carregarEstudosDoDia() {
    try {
      this.carregandoEstudos = true;
      const user = await this.supabaseService.getUsuarioAtual();
      if (!user) {
        this.estudosDia = [];
        return;
      }

      const { data: blocos, error } = await this.supabaseService.client
        .from('blocos_estudo')
        .select('id, titulo, conteudo_html_md, concluido')
        .eq('user_id', user.id)
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar estudos do dia:', error.message);
        return;
      }

      const lista = blocos || [];

      this.estudosTotal = lista.length;
      this.estudosConcluidos = lista.filter(b => b.concluido === true).length;

      this.estudosDia = lista
        .filter(b => b.concluido !== true)
        .slice(0, this.LIMITE_ESTUDOS_DIA)
        .map(b => ({
          id: b.id,
          titulo: b.titulo,
          tempo: b.conteudo_html_md || '30m'
        }));
    } catch (err) {
      console.error('Erro na requisição dos estudos do dia:', err);
    } finally {
      this.carregandoEstudos = false;
    }
  }

  // Total de minutos focados hoje (tabela foco_diario, somada pelo trigger do banco)
  async carregarFocoHoje() {
    try {
      const hoje = new Date().toLocaleDateString('en-CA', { timeZone: this.FUSO_HORARIO });

      const { data, error } = await this.supabaseService.client
        .from('foco_diario')
        .select('total_minutos')
        .eq('dia', hoje)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar foco do dia:', error.message);
        return;
      }

      this.focoTotal = this.formatarMinutos(data?.total_minutos ?? 0);
    } catch (err) {
      console.error('Erro na requisição do foco do dia:', err);
    }
  }

  // Formata minutos: "1h05m" a partir de 1 hora, senão "25m"
  private formatarMinutos(totalMinutos: number): string {
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    if (horas > 0) {
      return `${horas}h${minutos.toString().padStart(2, '0')}m`;
    }
    return `${minutos}m`;
  }
}