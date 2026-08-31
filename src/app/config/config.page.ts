import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
  standalone: false
})
export class ConfigPage implements OnInit {

  // Armazena 'Noturno' ou 'Diurno'
  temaAtual: string = 'Noturno';
  idiomaAtual: string = 'Português';
  sonsAtivado: string = 'Ativado';

  constructor(
    private navCtrl: NavController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.aplicarTemaSalvo();
  }

  ionViewWillEnter() {
    this.carregarConfiguracoes();
  }

  carregarConfiguracoes() {
    this.temaAtual = localStorage.getItem('app_tema') || 'Noturno';
    this.idiomaAtual = localStorage.getItem('app_idioma') || 'Português';
    
    const sons = localStorage.getItem('app_sons');
    this.sonsAtivado = sons !== null ? (sons === 'true' ? 'Ativado' : 'Desativado') : 'Ativado';
  }

  // Função chamada diretamente ao clicar no botão "Tema"
  alternarTema() {
    if (this.temaAtual === 'Noturno') {
      this.temaAtual = 'Diurno';
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    } else {
      this.temaAtual = 'Noturno';
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }

    // Salva a escolha do usuário
    localStorage.setItem('app_tema', this.temaAtual);
  }

  // Garante que ao abrir o app o tema correto seja aplicado
  aplicarTemaSalvo() {
    const tema = localStorage.getItem('app_tema') || 'Noturno';
    this.temaAtual = tema;

    if (tema === 'Diurno') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }
  }

  // Voltar para a tela anterior
  goBack() {
    this.navCtrl.navigateBack('/tabs/tab1');
  }

  // Método de Logout com confirmação
  async logout() {
    const alert = await this.alertController.create({
      header: 'Sair da conta',
      message: 'Tem certeza de que deseja sair?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          role: 'confirm',
          handler: () => {
            this.executarLogout();
          }
        }
      ]
    });

    await alert.present();
  }

  // Lógica de limpeza de sessão e navegação
  private executarLogout() {
    // 1. Limpa o armazenamento local (tokens, sessão, etc.)
    localStorage.clear();

    // 2. Redireciona o usuário para a tela de Login limpando o histórico de navegação
    this.navCtrl.navigateRoot('/login');
  }

}