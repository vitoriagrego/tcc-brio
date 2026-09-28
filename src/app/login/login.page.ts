import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  credenciais = {
    email: '',
    senha: ''
  };

  loginInvalido = false;
  mensagemErro = '';
  isModalOpen = false;
  emailRecuperacao = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  async executarLogin() {
    if (!this.credenciais.email || !this.credenciais.senha) {
      this.loginInvalido = true;
      this.mensagemErro = 'Por favor, preencha o e-mail e a senha.';
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Entrando...'
    });
    await loading.present();

    const { data, error } = await this.supabaseService.signIn(
      this.credenciais.email,
      this.credenciais.senha
    );

    await loading.dismiss();

    if (error) {
      this.loginInvalido = true;
      this.mensagemErro = 'E-mail ou senha inválidos.';
    } else {
      this.loginInvalido = false;
      this.router.navigate(['/tabs', 'tab1']);
    }
  }

  abrirModalRecuperacao() {
    this.isModalOpen = true;
  }

  fecharModalRecuperacao() {
    this.isModalOpen = false;
  }

  async enviarEmailRecuperacao() {
    if (!this.emailRecuperacao) {
      this.exibirToast('Por favor, informe seu e-mail.');
      return;
    }

    const { error } = await this.supabaseService.resetPassword(this.emailRecuperacao);

    if (error) {
      this.exibirToast('Erro ao enviar e-mail: ' + error.message);
    } else {
      this.exibirToast('E-mail de recuperação enviado com sucesso!');
      this.fecharModalRecuperacao();
    }
  }

  private async exibirToast(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }
}