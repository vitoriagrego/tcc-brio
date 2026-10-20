import { Component, OnDestroy, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase';

interface PerfilUsuario {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  nivel: number;
  xp: number;
  ofensiva_dias: number;
  tempo_foco_maximo_dia: number; // Salvo em minutos no banco
  plano: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit, OnDestroy {
  // Informações do perfil carregadas do Supabase
  perfil: PerfilUsuario | null = null;
  xpPorcentagem: number = 0;
  carregandoPerfil: boolean = true;

  // Valor formatado do Foco Total
  focoTotal: string = '0m';
  private focoInterval: ReturnType<typeof setInterval> | null = null;

  tarefas = [
    {
      titulo: 'Estudar para a prova de Biologia',
      tempo: '1h30m'
    },
    {
      titulo: 'Leitura longa e profunda',
      tempo: '2 horas'
    }
  ];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    await this.carregarPerfilUsuario();
    this.atualizarFoco();
    
    // Atualiza o tempo de foco a cada segundo se houver cronômetro local em andamento
    this.focoInterval = setInterval(() => {
      this.atualizarFoco();
    }, 1000);
  }

  // Executa toda vez que a aba ganha foco no Ionic
  async ionViewWillEnter() {
    await this.carregarPerfilUsuario();
    this.atualizarFoco();
  }

  ngOnDestroy(): void {
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
          this.atualizarFoco();
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

  // Formata os minutos vindos do banco ou lê do localStorage se houver sessão ativa
  atualizarFoco(): void {
    const tempoLocal = localStorage.getItem('tempoFoco');

    if (tempoLocal) {
      // Se tiver tempo rodando localmente (em segundos)
      const segundos = Number(tempoLocal);
      const horas = Math.floor(segundos / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      const segundosRestantes = segundos % 60;

      if (horas > 0) {
        this.focoTotal = `${horas}h${minutos.toString().padStart(2, '0')}m`;
      } else {
        this.focoTotal = `${minutos}m${segundosRestantes.toString().padStart(2, '0')}s`;
      }
    } else if (this.perfil && this.perfil.tempo_foco_maximo_dia !== undefined) {
      // Usa o valor cadastrado na tabela profiles (salvo em minutos)
      const totalMinutos = this.perfil.tempo_foco_maximo_dia || 0;
      const horas = Math.floor(totalMinutos / 60);
      const minutos = totalMinutos % 60;

      if (horas > 0) {
        this.focoTotal = `${horas}h${minutos.toString().padStart(2, '0')}m`;
      } else {
        this.focoTotal = `${minutos}m`;
      }
    }
  }
}