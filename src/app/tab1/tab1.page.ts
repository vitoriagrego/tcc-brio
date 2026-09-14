import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit, OnDestroy {
  nivel = 17;
  xp = 70;
  focoTotal = '3h15m';
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

  ngOnInit(): void {
    this.atualizarFoco();
    this.focoInterval = setInterval(() => {
      this.atualizarFoco();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.focoInterval !== null) {
      clearInterval(this.focoInterval);
      this.focoInterval = null;
    }
  }

  atualizarFoco(): void {
    const tempo = localStorage.getItem('tempoFoco');

    if (tempo) {
      const segundos = Number(tempo);
      const horas = Math.floor(segundos / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      const segundosRestantes = segundos % 60;

      if (horas > 0) {
        this.focoTotal = `${horas}h${minutos.toString().padStart(2, '0')}m`;
      } else {
        this.focoTotal = `${minutos}m${segundosRestantes.toString().padStart(2, '0')}s`;
      }
    }
  }
}