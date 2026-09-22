import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  credenciais = {
    email: '',
    senha: ''
  };

  isModalOpen: boolean = false;
  emailRecuperacao: string = '';

  loginInvalido: boolean = false;
  mensagemErro: string = '';

  constructor(
    private router: Router,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() { }

  executarLogin() {
    this.loginInvalido = false;

    if (!this.credenciais.email || !this.credenciais.senha) {
      this.loginInvalido = true;
      this.mensagemErro = 'Por favor, preencha todos os campos.';
      return;
    }

    console.log('Login realizado com sucesso:', this.credenciais);
    this.router.navigate(['/tabs/tab1']);
  }

  abrirModalRecuperacao() {
    this.isModalOpen = true;
  }

  fecharModalRecuperacao() {
    this.isModalOpen = false;
    this.emailRecuperacao = '';
  }

  async enviarEmailRecuperacao() {
    if (!this.emailRecuperacao) {
      const alert = await this.alertCtrl.create({
        header: 'Atenção',
        message: 'Por favor, digite seu e-mail de recuperação.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const emailEnviado = this.emailRecuperacao;
    this.fecharModalRecuperacao();

    const alert = await this.alertCtrl.create({
      header: 'E-mail Enviado!',
      message: `Se o e-mail ${emailEnviado} estiver cadastrado, você receberá o link em instantes.`,
      buttons: ['OK']
    });

    await alert.present();
  }
}