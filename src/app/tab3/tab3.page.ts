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

  // Fuso usado para definir "o dia" (precisa ser o mesmo do trigger no banco)
  private readonly FUSO_HORARIO = 'America/Sao_Paulo';

  // =====================================================
  // TIMER & ESTADO
  // =====================================================
  secondsLeft: number = this.POMODORO_TIME;
  currentPhase: TimerPhase = 'pomodoro';
  completedPomodoros: number = 0;
  cycleNumber: number = 1;

  isRunning: boolean = false;
  hasStarted: boolean = false;

  // Total de minutos focados hoje (vem da tabela foco_diario)
  focoHojeMinutos: number = 0;

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private endTime: number | null = null;

  // =====================================================
  // RELÓGIO
  // =====================================================
  hourRotation: number = 0;
  minuteRotation: number = 0;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.resetTimerState();
    this.atualizarFocoHoje();
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

  /**
   * Pausar NÃO grava nada no banco: ao continuar, o timer segue do mesmo
   * secondsLeft, então o tempo só é contabilizado uma vez (ao finalizar,
   * pular ou concluir o pomodoro).
   */
  private pauseTimer(): void {
    this.isRunning = false;
    this.clearTimer();
    this.endTime = null;
    this.updateClockHands();
  }

  stopTimer(): void {
    if (this.currentPhase === 'pomodoro') {
      // Salva o tempo parcial estudado (se houver ao menos 1 minuto)
      this.registrarSessao(this.POMODORO_TIME - this.secondsLeft);
    }
    this.clearTimer();
    this.resetTimerState();
    this.endTime = null;
  }

  skipToBreak(): void {
    if (this.currentPhase === 'pomodoro') {
      // Salva o tempo parcial estudado (se houver ao menos 1 minuto)
      this.registrarSessao(this.POMODORO_TIME - this.secondsLeft);
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
      // Atualiza o estado ANTES de aguardar o banco, para a UI não travar em 00:00
      this.completedPomodoros++;
      this.currentPhase = (this.completedPomodoros >= this.POMODOROS_BEFORE_LONG_BREAK)
        ? 'longBreak'
        : 'shortBreak';

      this.secondsLeft = this.getPhaseDuration();
      this.hasStarted = false;
      this.updateClockHands();

      // Sessão completa: o trigger do banco soma no total diário (foco_diario)
      await this.registrarSessao(this.POMODORO_TIME);
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

  /**
   * Recupera o ID do usuário autenticado.
   * (Sem fallback para outro perfil: evita gravar dados no usuário errado.)
   */
  private async obterUserId(): Promise<string | null> {
    try {
      const user = await this.supabaseService.getUsuarioAtual();
      if (user?.id) return user.id;

      const { data: { session } } = await this.supabaseService.client.auth.getSession();
      return session?.user?.id ?? null;
    } catch (e) {
      console.warn('⚠️ Não foi possível determinar o user_id:', e);
      return null;
    }
  }

  /**
   * Grava UMA sessão na tabela sessoes_pomodoro.
   * O total diário (tabela foco_diario) é somado automaticamente pelo trigger
   * trg_somar_foco_diario no banco.
   * Só salva se a sessão tiver ao menos 1 minuto.
   */
  private async registrarSessao(segundos: number): Promise<void> {
    const minutos = Math.floor(segundos / 60);
    if (minutos < 1) return;

    try {
      const userId = await this.obterUserId();
      if (!userId) {
        console.warn('⚠️ Usuário não autenticado. Sessão não salva.');
        return;
      }

      const { error } = await this.supabaseService.client
        .from('sessoes_pomodoro')
        .insert({ user_id: userId, duracao_minutos: minutos });

      if (error) {
        console.error('❌ Erro Supabase ao salvar sessoes_pomodoro:', error.message, error.details);
        return;
      }

      console.log(`✅ Sessão de ${minutos} min registrada.`);
      await this.atualizarFocoHoje();
    } catch (err) {
      console.error('❌ Erro ao executar registrarSessao:', err);
    }
  }

  /**
   * Busca o total de minutos focados hoje (tabela foco_diario).
   */
  async carregarFocoHoje(): Promise<number> {
    try {
      const hoje = new Date().toLocaleDateString('en-CA', { timeZone: this.FUSO_HORARIO });

      const { data, error } = await this.supabaseService.client
        .from('foco_diario')
        .select('total_minutos')
        .eq('dia', hoje)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao carregar foco_diario:', error.message);
        return 0;
      }

      return data?.total_minutos ?? 0;
    } catch (err) {
      console.error('❌ Erro ao executar carregarFocoHoje:', err);
      return 0;
    }
  }

  private async atualizarFocoHoje(): Promise<void> {
    this.focoHojeMinutos = await this.carregarFocoHoje();
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