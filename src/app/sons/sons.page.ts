import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';

interface SomAmbientacao {
  id: string;
  nome: string;
  arquivo: string;
  ativo: boolean;
}

@Component({
  selector: 'app-sons',
  templateUrl: './sons.page.html',
  styleUrls: ['./sons.page.scss'],
  standalone: false
})
export class SonsPage implements OnInit, OnDestroy {

  audioPlayer: HTMLAudioElement | null = null;

  sons: SomAmbientacao[] = [
    { id: '1', nome: 'Som Ambiente 1', arquivo: 'somAmbiente.mp3', ativo: false },
    { id: '2', nome: 'Som Ambiente 2', arquivo: 'somAmbiente2.mp3', ativo: false },
    { id: '3', nome: 'Som Ambiente 3', arquivo: 'somAmbiente3.mp3', ativo: false },
    { id: '4', nome: 'Som Ambiente 4', arquivo: 'somAmbiente4.mp3', ativo: false },
    { id: '5', nome: 'Room Tone', arquivo: 'roomTone.mp3', ativo: false },
    { id: '6', nome: 'Ruído Branco', arquivo: 'ruido.mp3', ativo: false },
    { id: '7', nome: 'Ruído Marrom', arquivo: 'ruidoMarrom.mp3', ativo: false },
    { id: '8', nome: 'Chuva 1', arquivo: 'chuva.mp3', ativo: false },
    { id: '9', nome: 'Chuva 2', arquivo: 'chuva2.mp3', ativo: false },
    { id: '10', nome: 'Chuva 3', arquivo: 'chuva3.mp3', ativo: false },
    { id: '11', nome: 'Cachoeira', arquivo: 'cachoeira.mp3', ativo: false },
    { id: '12', nome: 'Som do mar', arquivo: 'oceano.mp3', ativo: false }
  ];

  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    this.carregarSomAtivo();
  }

  ngOnDestroy() {
    this.pararAudio();
  }

  carregarSomAtivo() {
    const somSalvoId = localStorage.getItem('app_som_ativo_id');
    if (somSalvoId) {
      const som = this.sons.find(s => s.id === somSalvoId);
      if (som) {
        som.ativo = true;
      }
    }
  }

  toggleSom(somSelecionado: SomAmbientacao) {
    // Se clicar no som que já está tocando, ele desativa
    if (somSelecionado.ativo) {
      somSelecionado.ativo = false;
      this.pararAudio();
      localStorage.removeItem('app_som_ativo_id');
      localStorage.setItem('app_sons', 'false');
      return;
    }

    // Desativa todos os outros
    this.sons.forEach(s => s.ativo = false);

    // Ativa o som clicado
    somSelecionado.ativo = true;
    localStorage.setItem('app_som_ativo_id', somSelecionado.id);
    localStorage.setItem('app_sons', 'true');

    // Reproduz o áudio salvo na pasta assets/sounds/
    this.tocarAudio(somSelecionado.arquivo);
  }

  tocarAudio(nomeArquivo: string) {
    this.pararAudio();
    // Exemplo do caminho do arquivo local:
    this.audioPlayer = new Audio(`assets/sounds/${nomeArquivo}`);
    this.audioPlayer.loop = true; // Mantém o som ambiente em repetição
    this.audioPlayer.play().catch(e => console.log('Adicione os arquivos MP3 na pasta assets/sounds/'));
  }

  pararAudio() {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer = null;
    }
  }

  goBack() {
    this.navCtrl.navigateBack('/config');
  }

}