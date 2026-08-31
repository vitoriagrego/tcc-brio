import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-sobre',
  templateUrl: './sobre.page.html',
  styleUrls: ['./sobre.page.scss'],
  standalone: false
})
export class SobrePage implements OnInit {

  appVersion: string = '1.0.0';
  empresaNome: string = 'Miauchemista  Studios';
  anoAtual: number = new Date().getFullYear();

  // Controle do Modal Legal
  modalAberto: boolean = false;
  modalTitulo: string = '';
  modalTexto: string = '';

  constructor(private navCtrl: NavController) {}

  ngOnInit() {}

  abrirModal(tipo: 'termos' | 'privacidade') {
    if (tipo === 'termos') {
      this.modalTitulo = 'Termos de Uso';
      this.modalTexto = 'Ao utilizar o aplicativo BRIO, você concorda em utilizar as ferramentas para fins pessoais e de desenvolvimento próprio. Todos os dados inseridos são de sua responsabilidade...';
    } else {
      this.modalTitulo = 'Política de Privacidade';
      this.modalTexto = 'Respeitamos a sua privacidade. Seus dados pessoais e de progresso são armazenados localmente e/ou criptografados. Não compartilhamos informações com terceiros...';
    }
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  goBack() {
    this.navCtrl.navigateBack('/config');
  }

}