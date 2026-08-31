import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit, OnDestroy {

  /**
   * 25 minutos
   */
  readonly pomodoroDuration = 25 * 60;
  /**
   * Tempo restante.
   */
  timeLeft = this.pomodoroDuration;

  /**
   * Estado do Pomodoro.
   */
  isRunning = false;

  private timerInterval?: ReturnType<typeof setInterval>;


  constructor() {}


  ngOnInit(): void {

    /*
     * Se quiser que comece automaticamente,
     * troque para:
     *
     * this.startTimer();
     */

    this.isRunning = false;
  }


  ngOnDestroy(): void {

    this.stopTimer();

  }


  /**
   * Começa o Pomodoro.
   */
  startTimer(): void {

    if (this.timerInterval) {
      return;
    }

    this.isRunning = true;

    this.timerInterval = setInterval(() => {

      if (this.timeLeft > 0) {

        this.timeLeft--;

      } else {

        this.stopTimer();

      }

    }, 1000);
  }


  /**
   * Para o contador.
   */
  stopTimer(): void {

    if (this.timerInterval) {

      clearInterval(this.timerInterval);

      this.timerInterval = undefined;
    }

    this.isRunning = false;
  }


  /**
   * Pausar / continuar.
   */
  toggleTimer(): void {

    if (this.isRunning) {

      this.stopTimer();

    } else {

      this.startTimer();

    }
  }


  /**
   * Finalizar Pomodoro.
   */
  finishTimer(): void {

    this.stopTimer();

    this.timeLeft = this.pomodoroDuration;

  }


  /**
   * Converte segundos para MM:SS.
   */
  formatTime(totalSeconds: number): string {

    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    return (
      this.pad(minutes) +
      ':' +
      this.pad(seconds)
    );
  }


  private pad(value: number): string {

    return value
      .toString()
      .padStart(2, '0');

  }


  /**
   * Posição do ponteiro das horas.
   */
  get hourRotation(): number {

    const elapsed =
      this.pomodoroDuration - this.timeLeft;

    const minutes =
      elapsed / 60;

    return (
      minutes / 60
    ) * 360;

  }


  /**
   * Posição do ponteiro dos minutos.
   */
  get minuteRotation(): number {

    const elapsed =
      this.pomodoroDuration - this.timeLeft;

    const minutes =
      elapsed / 60;

    return minutes * 360;

  }

}