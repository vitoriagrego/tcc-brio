import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  loginInvalido: boolean = false;
  mensagemErro: string = '';

  constructor(private router: Router) { }

  ngOnInit() {
  }

  executarLogin() {

  this.loginInvalido = false;
  this.mensagemErro = '';

  // valida apenas se os campos foram preenchidos
  if (!this.credenciais.email || !this.credenciais.senha) {

    this.loginInvalido = true;
    this.mensagemErro = 'Preencha todos os campos para continuar.';
    return;

  }

  // sem validação de usuário/senha
  console.log('Entrando no sistema...');

  this.router.navigateByUrl('/tabs/tab1');

}

}