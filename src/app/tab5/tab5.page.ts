import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: false
})
export class Tab5Page implements OnInit {

  usuario = {
    nickname: 'Nickname',
    nome: 'Nome do usuário',
    avatar: 'assets/avatar-gato.png', // Substitua pelo seu asset local
    nivel: 17,
    xpAtual: 850,
    xpTotal: 1000,
    guilda: 'Guilda dos Alquimistas'
  };

  materiaPrestigio = {
    nome: 'Química',
    nivel: 1,
    progresso: 0.5 // 50%
  };

  tempoMedioEstudo = {
    horas: '3',
    minutos: '00'
  };

  principalConquista = {
    nome: 'Runa de Aetherios'
  };

  // Cálculo dinâmico para a barra de progresso (0 a 1)
  get progressoXp(): number {
    return this.usuario.xpAtual / this.usuario.xpTotal;
  }

  constructor(private navCtrl: NavController) {}

  ngOnInit() {}

  alterarPerfil() {
    this.navCtrl.navigateForward('/editar-perfil');
  }


  ionViewWillEnter() {
  const nomeSalvo = localStorage.getItem('app_user_nickname');
  if (nomeSalvo) {
    this.usuario.nickname = nomeSalvo;
  }

  const avatarSalvo = localStorage.getItem('app_user_avatar');
  if (avatarSalvo) {
    this.usuario.avatar = avatarSalvo;
  }
}
}