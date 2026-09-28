import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: false,
})
export class CadastroPage {
  email = '';
  senha = '';
  confirmarSenha = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  async cadastrar() {
    if (!this.email || !this.senha || !this.confirmarSenha) {
      this.exibirToast('Preencha todos os campos.');
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.exibirToast('As senhas não coincidem.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Criando conta...'
    });
    await loading.present();

    const { data, error } = await this.supabaseService.signUp(this.email, this.senha);

    await loading.dismiss();

    if (error) {
      this.exibirToast('Erro ao cadastrar: ' + error.message);
    } else {
      this.exibirToast('Conta criada com sucesso!');
      this.router.navigate(['/questionario']);
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