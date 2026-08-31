import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: false
})
export class EditarPerfilPage implements OnInit {

  // Dados do Usuário
  nickname: string = 'Nickname';
  avatarAtual: string = 'assets/perfil.png';
  avatarSelecionado: string = 'assets/perfil3.png';

  // Opções de Avatares disponíveis
  opcoesAvatares: string[] = [
    'assets/perfil.png',
    'assets/perfil2.png',
    'assets/perfil3.png',
    'assets/perfil4.png',
    'assets/perfil5.png',
    'assets/perfil6.png',
    'assets/perfil7.png'
  ];

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.carregarDadosAtuais();
  }

  carregarDadosAtuais() {
    // Busca do localStorage se já houver algo salvo
    const nomeSalvo = localStorage.getItem('app_user_nickname');
    if (nomeSalvo) {
      this.nickname = nomeSalvo;
    }

    const avatarSalvo = localStorage.getItem('app_user_avatar');
    if (avatarSalvo) {
      this.avatarAtual = avatarSalvo;
      this.avatarSelecionado = avatarSalvo;
    }
  }

  selecionarAvatar(path: string) {
    this.avatarSelecionado = path;
  }

  async salvarPerfil() {
    if (!this.nickname.trim()) {
      const toastErro = await this.toastCtrl.create({
        message: 'O nome de usuário não pode ficar em branco.',
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      await toastErro.present();
      return;
    }

    // Atualiza o estado local e salva temporariamente no localStorage
    this.avatarAtual = this.avatarSelecionado;
    localStorage.setItem('app_user_nickname', this.nickname);
    localStorage.setItem('app_user_avatar', this.avatarAtual);

    // Futuramente aqui entrará a chamada da API/Banco de Dados
    console.log('Perfil Salvo:', { nickname: this.nickname, avatar: this.avatarAtual });

    const toast = await this.toastCtrl.create({
      message: 'Perfil atualizado com sucesso!',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    this.navCtrl.back();
  }

  goBack() {
    this.navCtrl.navigateBack('/tabs/tab5');
  }
}