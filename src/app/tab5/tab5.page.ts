import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: false
})
export class Tab5Page implements OnInit, OnDestroy {

  usuario = {
    nickname: 'Nickname',
    nome: 'Nome do usuário',
    avatar: 'assets/perfil.png',
    nivel: 17,
    xpAtual: 850,
    xpTotal: 1000,
    guilda: 'Guilda dos Alquimistas'
  };

  materiaPrestigio = {
    nome: 'Química',
    nivel: 1,
    progresso: 0.5
  };

  tempoMedioEstudo = {
    horas: '3',
    minutos: '00'
  };

  principalConquista = {
    nome: 'Runa de Aetherios'
  };

  private originalSetItem = localStorage.setItem;

  get progressoXp(): number {
    return this.usuario.xpAtual / this.usuario.xpTotal;
  }

  constructor(
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.carregarDados();
    this.ouvirAlteracoesLocalStorage();
  }

  ngOnDestroy() {
    // Restaura o localStorage padrão ao destruir a página
    if (this.originalSetItem) {
      localStorage.setItem = this.originalSetItem;
    }
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  ionViewDidEnter() {
    this.carregarDados();
  }

  carregarDados() {
    this.ngZone.run(() => {
      const nomeSalvo = localStorage.getItem('app_user_nickname');
      const avatarSalvo = localStorage.getItem('app_user_avatar');

      if (nomeSalvo) {
        this.usuario.nickname = nomeSalvo;
      }

      if (avatarSalvo) {
        this.usuario.avatar = avatarSalvo;
      }

      this.cdr.detectChanges();
    });
  }

  // Intercepta qualquer salvamento no localStorage feito em qualquer tela do app
  private ouvirAlteracoesLocalStorage() {
    const self = this;
    localStorage.setItem = function (key: string, value: string) {
      self.originalSetItem.apply(this, [key, value]);
      if (key === 'app_user_nickname' || key === 'app_user_avatar') {
        self.carregarDados();
      }
    };
  }

  alterarPerfil() {
    this.navCtrl.navigateForward('/editar-perfil');
  }
}