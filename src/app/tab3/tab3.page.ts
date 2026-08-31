import { Component, OnInit, OnDestroy } from '@angular/core';

type TimerPhase = 'pomodoro' | 'shortBreak' | 'longBreak';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit, OnDestroy {

  // =========================
  // CONFIGURAÇÃO DO POMODORO
  // =========================

  readonly POMODORO_TIME = 25 * 60;      // 25 minutos
  readonly SHORT_BREAK_TIME = 5 * 60;    // 5 minutos
  readonly LONG_BREAK_TIME = 15 * 60;    // 15 minutos

  // Depois de quantos pomodoros acontece a pausa longa
  readonly POMODOROS_BEFORE_LONG_BREAK = 4;


  // =========================
  // ESTADO DO TIMER
  // =========================

  secondsLeft: number = this.POMODORO_TIME;

  isPaused: boolean = false;

  currentPhase: TimerPhase = 'pomodoro';

  // Quantos pomodoros foram concluídos no ciclo atual
  completedPomodoros: number = 0;

  // Número do ciclo atual
  cycleNumber: number = 1;


  // =========================
  // CONTROLE INTERNO
  // =========================

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Momento em que a fase atual deve terminar.
   *
   * Exemplo:
   * agora + 25 minutos
   */
  private endTime: number | null = null;


  // =========================
  // RELÓGIO VISUAL
  // =========================

  hourRotation: number = 135;
  minuteRotation: number = 60;


  // =========================
  // INICIALIZAÇÃO
  // =========================

  ngOnInit(): void {
    this.startTimer();
  }


  ngOnDestroy(): void {
    this.clearTimer();
  }


  // =========================
  // INICIAR TIMER
  // =========================

  startTimer(): void {

    this.clearTimer();

    this.isPaused = false;

    // Define quando essa fase termina
    this.endTime = Date.now() + (this.secondsLeft * 1000);

    this.updateTimer();

    /**
     * Atualizamos algumas vezes por segundo.
     *
     * O valor real não depende da quantidade
     * de vezes que esse intervalo executou.
     */
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 250);
  }


  // =========================
  // ATUALIZAR TIMER
  // =========================

  private updateTimer(): void {

    if (this.isPaused || this.endTime === null) {
      return;
    }

    const millisecondsLeft = this.endTime - Date.now();

    const newSecondsLeft = Math.max(
      0,
      Math.ceil(millisecondsLeft / 1000)
    );

    this.secondsLeft = newSecondsLeft;

    this.updateClockHands();

    // Terminou a fase atual
    if (millisecondsLeft <= 0) {
      this.finishPhase();
    }
  }


  // =========================
  // PAUSAR / CONTINUAR
  // =========================

  togglePause(): void {

    if (this.isPaused) {

      // CONTINUAR

      this.startTimer();

    } else {

      // PAUSAR

      this.isPaused = true;

      this.clearTimer();

      /**
       * Mantemos secondsLeft com o valor atual.
       * Quando clicar em continuar, um novo endTime
       * será calculado.
       */
      this.endTime = null;
    }
  }


  // =========================
  // FINALIZAR
  // =========================

  stopTimer(): void {

    this.isPaused = true;

    this.clearTimer();

    this.secondsLeft = 0;

    this.endTime = null;

    this.updateClockHands();
  }


  // =========================
  // FASE TERMINOU
  // =========================

  private finishPhase(): void {

    this.clearTimer();

    this.secondsLeft = 0;

    // =========================
    // POMODORO TERMINOU
    // =========================

    if (this.currentPhase === 'pomodoro') {

      this.completedPomodoros++;

      /**
       * A cada 4 pomodoros:
       *
       * Pomodoro → Long Break
       *
       * Caso contrário:
       *
       * Pomodoro → Short Break
       */
      if (
        this.completedPomodoros >=
        this.POMODOROS_BEFORE_LONG_BREAK
      ) {

        this.currentPhase = 'longBreak';

      } else {

        this.currentPhase = 'shortBreak';
      }


      this.secondsLeft = this.getPhaseDuration();

      this.showPhaseNotification();

      // Começa automaticamente a pausa
      this.startTimer();

      return;
    }


    // =========================
    // PAUSA TERMINOU
    // =========================

    if (
      this.currentPhase === 'shortBreak' ||
      this.currentPhase === 'longBreak'
    ) {

      /**
       * Se terminou uma pausa longa,
       * começamos um novo ciclo.
       */
      if (this.currentPhase === 'longBreak') {

        this.completedPomodoros = 0;
        this.cycleNumber++;
      }

      this.currentPhase = 'pomodoro';

      this.secondsLeft = this.getPhaseDuration();

      this.showPhaseNotification();

      // Começa automaticamente o próximo Pomodoro
      this.startTimer();
    }
  }


  // =========================
  // DURAÇÃO DA FASE
  // =========================

  private getPhaseDuration(): number {

    switch (this.currentPhase) {

      case 'pomodoro':
        return this.POMODORO_TIME;

      case 'shortBreak':
        return this.SHORT_BREAK_TIME;

      case 'longBreak':
        return this.LONG_BREAK_TIME;
    }
  }


  // =========================
  // TEXTO DA FASE
  // =========================

  get phaseTitle(): string {

    switch (this.currentPhase) {

      case 'pomodoro':
        return 'Hora de focar';

      case 'shortBreak':
        return 'Pausa curta';

      case 'longBreak':
        return 'Pausa longa';
    }
  }


  get phaseDescription(): string {

    switch (this.currentPhase) {

      case 'pomodoro':
        return 'Estude com concentração.';

      case 'shortBreak':
        return 'Respire e descanse um pouco.';

      case 'longBreak':
        return 'Você merece uma pausa maior.';
    }
  }


  // =========================
  // CONTADOR VISUAL
  // =========================

  get cycleProgress(): string {

    if (this.currentPhase === 'pomodoro') {
      return `${this.completedPomodoros + 1}/${this.POMODOROS_BEFORE_LONG_BREAK}`;
    }

    return `${this.completedPomodoros}/${this.POMODOROS_BEFORE_LONG_BREAK}`;
  }


  // =========================
  // RELÓGIO VISUAL
  // =========================

  private updateClockHands(): void {

    const totalSeconds = this.getPhaseDuration();

    const elapsedSeconds = totalSeconds - this.secondsLeft;

    /**
     * Para o ponteiro dos minutos:
     *
     * 60 minutos = 360 graus
     *
     * Então cada minuto = 6 graus.
     */
    const elapsedMinutes = elapsedSeconds / 60;

    this.minuteRotation = elapsedMinutes * 6;


    /**
     * Ponteiro das horas.
     *
     * 60 minutos = 30 graus.
     */
    this.hourRotation = elapsedMinutes * 0.5;
  }


  // =========================
  // FORMATAÇÃO
  // =========================

  formatTime(totalSeconds: number): string {

    const mins = Math.floor(totalSeconds / 60);

    const secs = totalSeconds % 60;

    const formattedMins =
      mins < 10 ? `0${mins}` : `${mins}`;

    const formattedSecs =
      secs < 10 ? `0${secs}` : `${secs}`;

    return `${formattedMins}:${formattedSecs}`;
  }


  // =========================
  // LIMPAR TIMER
  // =========================

  private clearTimer(): void {

    if (this.timerInterval !== null) {

      clearInterval(this.timerInterval);

      this.timerInterval = null;
    }
  }


  // =========================
  // NOTIFICAÇÃO SIMPLES
  // =========================

  private showPhaseNotification(): void {

    console.log(
      `Fase concluída. Próxima fase: ${this.phaseTitle}`
    );

    // Depois podemos trocar isso por:
    // - Ionic Toast
    // - alerta
    // - som
    // - notificação nativa
  }
}
