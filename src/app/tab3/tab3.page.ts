import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

type TimerPhase =
  'pomodoro' |
  'shortBreak' |
  'longBreak';


@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false
})
export class Tab3Page implements OnInit, OnDestroy {


  // =====================================================
  // TEMPOS FIXOS
  // =====================================================

  readonly POMODORO_TIME = 25 * 60;

  readonly SHORT_BREAK_TIME = 5 * 60;

  readonly LONG_BREAK_TIME = 15 * 60;

  readonly POMODOROS_BEFORE_LONG_BREAK = 4;


  // =====================================================
  // TIMER
  // =====================================================

  secondsLeft: number = this.POMODORO_TIME;

  currentPhase: TimerPhase = 'pomodoro';

  completedPomodoros: number = 0;

  cycleNumber: number = 1;


  // =====================================================
  // CONTROLE
  // =====================================================

  isRunning: boolean = false;

  hasStarted: boolean = false;


  // =====================================================
  // CONTROLE INTERNO
  // =====================================================

  private timerInterval:
    ReturnType<typeof setInterval> | null = null;

  private endTime: number | null = null;

  private focoInicial: number = 0;


  // =====================================================
  // RELÓGIO
  // =====================================================

  hourRotation: number = 0;

  minuteRotation: number = 0;


  // =====================================================
  // INICIALIZAÇÃO
  // =====================================================

  ngOnInit(): void {

    this.isRunning = false;

    this.hasStarted = false;

    this.currentPhase = 'pomodoro';

    this.secondsLeft = this.POMODORO_TIME;

    this.completedPomodoros = 0;

    this.cycleNumber = 1;

    this.updateClockHands();
  }


  // =====================================================
  // DESTRUIR
  // =====================================================

  ngOnDestroy(): void {

    this.clearTimer();

  }


  // =====================================================
  // INICIAR TIMER
  // =====================================================

  startTimer(): void {

    this.clearTimer();

    this.isRunning = true;

    this.hasStarted = true;


    this.focoInicial = Number(
      localStorage.getItem('tempoFoco') || 0
    );


    this.endTime =
      Date.now() + (this.secondsLeft * 1000);


    this.updateTimer();


    this.timerInterval = setInterval(() => {

      this.updateTimer();

    }, 250);

  }


  // =====================================================
  // ATUALIZAR TIMER
  // =====================================================

  private updateTimer(): void {

    if (
      !this.isRunning ||
      this.endTime === null
    ) {

      return;

    }


    const millisecondsLeft =
      this.endTime - Date.now();


    const newSecondsLeft =
      Math.max(
        0,
        Math.ceil(millisecondsLeft / 1000)
      );


    this.secondsLeft =
      newSecondsLeft;


    this.updateClockHands();


    // ===================================================
    // TEMPO DE FOCO
    // ===================================================

    if (
      this.currentPhase === 'pomodoro' &&
      this.isRunning
    ) {

      const tempoDecorrido =
        this.POMODORO_TIME -
        this.secondsLeft;


      const novoTempoFoco =
        this.focoInicial +
        tempoDecorrido;


      localStorage.setItem(
        'tempoFoco',
        String(novoTempoFoco)
      );

    }


    // ===================================================
    // TERMINOU
    // ===================================================

    if (millisecondsLeft <= 0) {

      this.finishPhase();

    }

  }


  // =====================================================
  // INICIAR / PAUSAR / CONTINUAR
  // =====================================================

  togglePause(): void {

    if (this.isRunning) {

      this.pauseTimer();

      return;

    }


    this.startTimer();

  }


  // =====================================================
  // PAUSAR
  // =====================================================

  private pauseTimer(): void {

    if (
      this.currentPhase === 'pomodoro'
    ) {

      const tempoDecorrido =
        this.POMODORO_TIME -
        this.secondsLeft;


      const novoTempoFoco =
        this.focoInicial +
        tempoDecorrido;


      localStorage.setItem(
        'tempoFoco',
        String(novoTempoFoco)
      );

    }


    this.isRunning = false;

    this.clearTimer();

    this.endTime = null;

    this.updateClockHands();

  }


  // =====================================================
  // FINALIZAR
  // =====================================================

  stopTimer(): void {

    if (
      this.currentPhase === 'pomodoro'
    ) {

      const tempoDecorrido =
        this.POMODORO_TIME -
        this.secondsLeft;


      const novoTempoFoco =
        this.focoInicial +
        tempoDecorrido;


      localStorage.setItem(
        'tempoFoco',
        String(novoTempoFoco)
      );

    }


    this.clearTimer();

    this.isRunning = false;

    this.hasStarted = false;

    this.currentPhase = 'pomodoro';

    this.secondsLeft =
      this.POMODORO_TIME;

    this.endTime = null;

    this.updateClockHands();

  }


  // =====================================================
  // PULAR PAUSA
  // =====================================================

  skipToBreak(): void {

    if (
      this.currentPhase === 'pomodoro'
    ) {

      const tempoDecorrido =
        this.POMODORO_TIME -
        this.secondsLeft;


      const novoTempoFoco =
        this.focoInicial +
        tempoDecorrido;


      localStorage.setItem(
        'tempoFoco',
        String(novoTempoFoco)
      );

    }


    this.clearTimer();

    this.isRunning = false;

    this.hasStarted = false;

    this.endTime = null;


    // ===================================================
    // POMODORO → PAUSA
    // ===================================================

    if (
      this.currentPhase === 'pomodoro'
    ) {

      this.completedPomodoros++;


      if (
        this.completedPomodoros >=
        this.POMODOROS_BEFORE_LONG_BREAK
      ) {

        this.currentPhase =
          'longBreak';

      } else {

        this.currentPhase =
          'shortBreak';

      }


      this.secondsLeft =
        this.getPhaseDuration();


      this.updateClockHands();

      return;

    }


    // ===================================================
    // PAUSA → POMODORO
    // ===================================================

    this.currentPhase =
      'pomodoro';


    this.secondsLeft =
      this.POMODORO_TIME;


    this.updateClockHands();

  }


  // =====================================================
  // FINALIZOU A FASE
  // =====================================================

  private finishPhase(): void {

    if (
      this.currentPhase === 'pomodoro'
    ) {

      const novoTempoFoco =
        this.focoInicial +
        this.POMODORO_TIME;


      localStorage.setItem(
        'tempoFoco',
        String(novoTempoFoco)
      );

    }


    this.clearTimer();

    this.isRunning = false;

    this.endTime = null;

    this.secondsLeft = 0;


    // ===================================================
    // POMODORO TERMINOU
    // ===================================================

    if (
      this.currentPhase === 'pomodoro'
    ) {

      this.completedPomodoros++;


      if (
        this.completedPomodoros >=
        this.POMODOROS_BEFORE_LONG_BREAK
      ) {

        this.currentPhase =
          'longBreak';

      } else {

        this.currentPhase =
          'shortBreak';

      }


      this.secondsLeft =
        this.getPhaseDuration();


      this.hasStarted = false;

      this.updateClockHands();

      return;

    }


    // ===================================================
    // PAUSA TERMINOU
    // ===================================================

    if (
      this.currentPhase === 'shortBreak' ||
      this.currentPhase === 'longBreak'
    ) {

      if (
        this.currentPhase === 'longBreak'
      ) {

        this.completedPomodoros = 0;

        this.cycleNumber++;

      }


      this.currentPhase =
        'pomodoro';


      this.secondsLeft =
        this.POMODORO_TIME;


      this.hasStarted = false;

      this.updateClockHands();

    }

  }


  // =====================================================
  // DURAÇÃO DA FASE
  // =====================================================

  private getPhaseDuration(): number {

    switch (this.currentPhase) {

      case 'pomodoro':
        return this.POMODORO_TIME;

      case 'shortBreak':
        return this.SHORT_BREAK_TIME;

      case 'longBreak':
        return this.LONG_BREAK_TIME;

      default:
        return this.POMODORO_TIME;

    }

  }


  // =====================================================
  // TÍTULO
  // =====================================================

  get phaseTitle(): string {

    switch (this.currentPhase) {

      case 'pomodoro':
        return 'Estudar alquimia';

      case 'shortBreak':
        return 'Pausa curta';

      case 'longBreak':
        return 'Pausa longa';

      default:
        return 'Estudar alquimia';

    }

  }


  // =====================================================
  // DESCRIÇÃO
  // =====================================================

  get phaseDescription(): string {

    switch (this.currentPhase) {

      case 'pomodoro':
        return 'Estude com concentração.';

      case 'shortBreak':
        return 'Respire e descanse um pouco.';

      case 'longBreak':
        return 'Você merece uma pausa maior.';

      default:
        return '';

    }

  }


  // =====================================================
  // PROGRESSO
  // =====================================================

  get cycleProgress(): string {

    if (
      this.currentPhase === 'pomodoro'
    ) {

      return `${this.completedPomodoros + 1}/${this.POMODOROS_BEFORE_LONG_BREAK}`;

    }


    return `${this.completedPomodoros}/${this.POMODOROS_BEFORE_LONG_BREAK}`;

  }


  // =====================================================
  // PONTEIROS DO RELÓGIO
  // =====================================================

  private updateClockHands(): void {

    const totalSeconds =
      this.getPhaseDuration();


    const elapsedSeconds =
      totalSeconds -
      this.secondsLeft;


    const elapsedMinutes =
      elapsedSeconds / 60;


    this.minuteRotation =
      elapsedMinutes * 6;


    this.hourRotation =
      elapsedMinutes * 0.5;

  }


  // =====================================================
  // FORMATAR TEMPO
  // =====================================================

  formatTime(totalSeconds: number): string {

    const mins =
      Math.floor(totalSeconds / 60);


    const secs =
      totalSeconds % 60;


    const formattedMins =
      mins < 10
        ? `0${mins}`
        : `${mins}`;


    const formattedSecs =
      secs < 10
        ? `0${secs}`
        : `${secs}`;


    return `${formattedMins}:${formattedSecs}`;

  }


  // =====================================================
  // LIMPAR TIMER
  // =====================================================

  private clearTimer(): void {

    if (
      this.timerInterval !== null
    ) {

      clearInterval(
        this.timerInterval
      );

      this.timerInterval = null;

    }

  }

}