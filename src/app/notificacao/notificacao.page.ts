import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  icone: string;
}

@Component({
  selector: 'app-notificacao',
  templateUrl: './notificacao.page.html',
  styleUrls: ['./notificacao.page.scss'],
  standalone: false
})
export class NotificacaoPage implements OnInit {

  notificacoes: Notificacao[] = [];

  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    this.carregarNotificacoes();
  }

  carregarNotificacoes() {
    // Busca as notificações salvas ou carrega a lista padrão
    const salvas = localStorage.getItem('app_notificacoes_lista');
    if (salvas) {
      this.notificacoes = JSON.parse(salvas);
    } else {
      this.notificacoes = [
        {
          id: 1,
          titulo: 'Bem-vindo ao BRIO!',
          mensagem: 'Sua conta foi configurada com sucesso.',
          data: 'Hoje',
          lida: false,
          icone: 'sparkles-outline'
        },
        {
          id: 2,
          titulo: 'Atualização de Sistema',
          mensagem: 'Nova versão disponível com melhorias de desempenho.',
          data: 'Ontem',
          lida: true,
          icone: 'construct-outline'
        }
      ];
      this.salvarState();
    }
  }

  marcarComoLida(item: Notificacao) {
    item.lida = true;
    this.salvarState();
  }

  limparTodas() {
    this.notificacoes = [];
    this.salvarState();
  }

  goBack() {

    this.navCtrl.navigateBack('/config');
  }

  private salvarState() {
    localStorage.setItem('app_notificacoes_lista', JSON.stringify(this.notificacoes));
  }
}