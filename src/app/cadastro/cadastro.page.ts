import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: false,
})
export class CadastroPage {
  // Inicializando as variáveis para evitar erros com o modo "strict" do TypeScript
  email = '';
  senha = '';
  confirmarSenha = '';

  constructor(
    private router: Router,
    private toastController: ToastController
  ) {}

  async cadastrar() {
    // 1. Validação se os campos estão vazios
    if (!this.email || !this.senha || !this.confirmarSenha) {
      await this.exibirMensagem('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    // 2. Validação simples de email
    if (!this.email.includes('@')) {
      await this.exibirMensagem('Insira um e-mail válido.', 'warning');
      return;
    }

    // 3. Validação de igualdade das senhas
    if (this.senha !== this.confirmarSenha) {
      await this.exibirMensagem('As senhas não coincidem!', 'danger');
      return;
    }

    // Se passou em tudo, simula o sucesso
    await this.exibirMensagem('Cadastro realizado com sucesso!', 'success');
    
    // Limpa os campos após o sucesso
    this.email = '';
    this.senha = '';
    this.confirmarSenha = '';

    // Navega de volta para o login (ajuste a rota se necessário)
    this.router.navigate(['/login']);
  }

  // Função auxiliar para mostrar notificações na tela
  async exibirMensagem(texto: string, cor: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 2500,
      color: cor,
      position: 'bottom'
    });
    await toast.present();
  }
}