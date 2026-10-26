import { Component, OnDestroy, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase';

type TimerPhase = 'pomodoro' | 'shortBreak' | 'longBreak';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false
})
export class Tab3Page implements OnInit, OnDestroy {

  // =====================================================
  // TEMPOS FIXOS (em segundos)
  // =====================================================
  readonly POMODORO_TIME = 25 * 60;
  readonly SHORT_BREAK_TIME = 5 * 60;
  readonly LONG_BREAK_TIME = 15 * 60;
  readonly POMODOROS_BEFORE_LONG_BREAK = 4;

  // =====================================================
  // TIMER & ESTADO
  // =====================================================
  secondsLeft: number = this.POMODORO_TIME;
  currentPhase: TimerPhase = 'pomodoro';
  completedPomodoros: number = 0;
  cycleNumber: number = 1;

  isRunning: boolean = false;
  hasStarted: boolean = false;

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private endTime: number | null = null;
  private focoInicial: number = 0;

  // =====================================================
  // RELÓGIO
  // =====================================================
  hourRotation: number = 0;
  minuteRotation: number = 0;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.resetTimerState();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private resetTimerState(): void {
    this.isRunning = false;
    this.hasStarted = false;
    this.currentPhase = 'pomodoro';
    this.secondsLeft = this.POMODORO_TIME;
    this.completedPomodoros = 0;
    this.cycleNumber = 1;
    this.updateClockHands();
  }

  // =====================================================
  // CONTROLE DO TIMER
  // =====================================================

  startTimer(): void {
    this.clearTimer();
    this.isRunning = true;
    this.hasStarted = true;

    this.focoInicial = Number(localStorage.getItem('tempoFoco') || 0);
    this.endTime = Date.now() + (this.secondsLeft * 1000);

    this.updateTimer();
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 250);
  }

  togglePause(): void {
    if (this.isRunning) {
      this.pauseTimer();
      return;
    }
    this.startTimer();
  }

  private pauseTimer(): void {
    if (this.currentPhase === 'pomodoro') {
      this.persistirTempoFocoLocal();
    }
    this.isRunning = false;
    this.clearTimer();
    this.endTime = null;
    this.updateClockHands();
  }

  stopTimer(): void {
    if (this.currentPhase === 'pomodoro') {
      this.persistirTempoFocoLocal();
    }
    this.clearTimer();
    this.resetTimerState();
    this.endTime = null;
  }

  skipToBreak(): void {
    if (this.currentPhase === 'pomodoro') {
      this.persistirTempoFocoLocal();
    }

    this.clearTimer();
    this.isRunning = false;
    this.hasStarted = false;
    this.endTime = null;

    if (this.currentPhase === 'pomodoro') {
      this.completedPomodoros++;
      this.currentPhase = (this.completedPomodoros >= this.POMODOROS_BEFORE_LONG_BREAK) 
        ? 'longBreak' 
        : 'shortBreak';

      this.secondsLeft = this.getPhaseDuration();
      this.updateClockHands();
      return;
    }

    this.currentPhase = 'pomodoro';
    this.secondsLeft = this.POMODORO_TIME;
    this.updateClockHands();
  }

  // =====================================================
  // ATUALIZAÇÃO E FINALIZAÇÃO DE FASE
  // =====================================================

  private updateTimer(): void {
    if (!this.isRunning || this.endTime === null) return;

    const millisecondsLeft = this.endTime - Date.now();
    this.secondsLeft = Math.max(0, Math.ceil(millisecondsLeft / 1000));
    this.updateClockHands();

    if (this.currentPhase === 'pomodoro' && this.isRunning) {
      this.persistirTempoFocoLocal();
    }

    if (millisecondsLeft <= 0) {
      this.finishPhase();
    }
  }

  private async finishPhase(): Promise<void> {
    this.clearTimer();
    this.isRunning = false;
    this.endTime = null;
    this.secondsLeft = 0;

    if (this.currentPhase === 'pomodoro') {
      this.persistirTempoFocoLocal(this.POMODORO_TIME);
      
      const minutosGanhos = Math.floor(this.POMODORO_TIME / 60);

      // 1. Salva a sessão individual na tabela sessoes_pomodoro
      await this.salvarSessaoPomodoro(minutosGanhos);

      // 2. Salva no Supabase os minutos acumulados e atualiza a ofensiva na tabela profiles
      await this.salvarProgressoNoSupabase(minutosGanhos);

      this.completedPomodoros++;
      this.currentPhase = (this.completedPomodoros >= this.POMODOROS_BEFORE_LONG_BREAK)
        ? 'longBreak'
        : 'shortBreak';

      this.secondsLeft = this.getPhaseDuration();
      this.hasStarted = false;
      this.updateClockHands();
      return;
    }

    if (this.currentPhase === 'shortBreak' || this.currentPhase === 'longBreak') {
      if (this.currentPhase === 'longBreak') {
        this.completedPomodoros = 0;
        this.cycleNumber++;
      }

      this.currentPhase = 'pomodoro';
      this.secondsLeft = this.POMODORO_TIME;
      this.hasStarted = false;
      this.updateClockHands();
    }
  }

  // =====================================================
  // PERSISTÊNCIA & SUPABASE
  // =====================================================

  private persistirTempoFocoLocal(tempoFixo?: number): void {
    const tempoDecorrido = tempoFixo ?? (this.POMODORO_TIME - this.secondsLeft);
    const novoTempoFoco = this.focoInicial + tempoDecorrido;
    localStorage.setItem('tempoFoco', String(novoTempoFoco));
  }

  /**
   * Recupera o ID do usuário conectado com verificações adicionais
   */
  private async obterUserId(): Promise<string | null> {
    try {
      const user = await this.supabaseService.getUsuarioAtual();
      if (user?.id) return user.id;

      const { data: { session } } = await this.supabaseService.client.auth.getSession();
      if (session?.user?.id) return session.user.id;

      // Fallback para capturar perfil em ambiente de testes local
      const { data: perfis } = await this.supabaseService.client
        .from('profiles')
        .select('id')
        .limit(1);

      return perfis && perfis.length > 0 ? perfis[0].id : null;
    } catch (e) {
      console.warn('⚠️ Não foi possível determinar o user_id:', e);
      return null;
    }
  }

  /**
   * Salva o registro individual na tabela sessoes_pomodoro
   */
  async salvarSessaoPomodoro(duracaoMinutos: number): Promise<void> {
    try {
      const userId = await this.obterUserId();

      const payload: any = {
        duracao_minutos: duracaoMinutos
      };

      if (userId) {
        payload.user_id = userId;
      }

      console.log('📤 Gravando em sessoes_pomodoro:', payload);

      const { data, error } = await this.supabaseService.client
        .from('sessoes_pomodoro')
        .insert([payload])
        .select();

      if (error) {
        console.error('❌ Erro Supabase ao salvar sessoes_pomodoro:', error.message, error.details);
      } else {
        console.log('✅ Sessão registrada na tabela sessoes_pomodoro:', data);
      }
    } catch (err) {
      console.error('❌ Erro ao executar salvarSessaoPomodoro:', err);
    }
  }

  /**
   * Salva os minutos acumulados no campo tempo_foco_maximo_dia da tabela profiles
   */
  async salvarProgressoNoSupabase(minutosGanhos: number): Promise<void> {
    try {
      const userId = await this.obterUserId();

      if (!userId) {
        console.warn('⚠️ Usuário não autenticado. Impossível atualizar a tabela profiles.');
        return;
      }

      // 1. Busca os dados atuais do perfil no Supabase
      const { data: perfil, error: fetchError } = await this.supabaseService.client
        .from('profiles')
        .select('tempo_foco_maximo_dia, ofensiva_dias')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar perfil para atualização de foco:', fetchError.message);
      }

      const focoAtual = perfil?.tempo_foco_maximo_dia || 0;
      const novoFocoTotal = focoAtual + minutosGanhos;

      let ofensiva = perfil?.ofensiva_dias || 0;
      if (ofensiva === 0) {
        ofensiva = 1;
      }

      console.log(`📤 Atualizando profiles: Tempo de Foco ${focoAtual}m -> ${novoFocoTotal}m`);

      // 2. Atualiza a tabela profiles com os novos valores de tempo_foco_maximo_dia e ofensiva_dias
      const { data, error } = await this.supabaseService.client
        .from('profiles')
        .update({
          tempo_foco_maximo_dia: novoFocoTotal,
          ofensiva_dias: ofensiva,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('❌ Erro Supabase ao atualizar profiles:', error.message, error.details);
      } else {
        console.log('✅ Tempo de foco atualizado com sucesso na tabela profiles:', data);
      }

    } catch (error) {
      console.error('❌ Erro ao executar salvarProgressoNoSupabase:', error);
    }
  }

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  private getPhaseDuration(): number {
    switch (this.currentPhase) {
      case 'pomodoro': return this.POMODORO_TIME;
      case 'shortBreak': return this.SHORT_BREAK_TIME;
      case 'longBreak': return this.LONG_BREAK_TIME;
      default: return this.POMODORO_TIME;
    }
  }

  get phaseTitle(): string {
    switch (this.currentPhase) {
      case 'pomodoro': return 'Estudar alquimia';
      case 'shortBreak': return 'Pausa curta';
      case 'longBreak': return 'Pausa longa';
      default: return 'Estudar alquimia';
    }
  }

  get phaseDescription(): string {
    switch (this.currentPhase) {
      case 'pomodoro': return 'Estude com concentração.';
      case 'shortBreak': return 'Respire e descanse um pouco.';
      case 'longBreak': return 'Você merece uma pausa maior.';
      default: return '';
    }
  }

  get cycleProgress(): string {
    if (this.currentPhase === 'pomodoro') {
      return `${this.completedPomodoros + 1}/${this.POMODOROS_BEFORE_LONG_BREAK}`;
    }
    return `${this.completedPomodoros}/${this.POMODOROS_BEFORE_LONG_BREAK}`;
  }

  private updateClockHands(): void {
    const totalSeconds = this.getPhaseDuration();
    const elapsedSeconds = totalSeconds - this.secondsLeft;
    const elapsedMinutes = elapsedSeconds / 60;

    this.minuteRotation = elapsedMinutes * 6;
    this.hourRotation = elapsedMinutes * 0.5;
  }

  formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${formattedMins}:${formattedSecs}`;
  }

  private clearTimer(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}