import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-guildas',
  templateUrl: './guildas.page.html',
  styleUrls: ['./guildas.page.scss'],
  standalone: false
})
export class GuildaPage implements OnInit {

  segmentoSelecionado: string = 'feed';

  feedAtividades = [
    {
      usuario: 'Luna Mistifel',
      acao: 'Completou 3 transmutações',
      tempo: '2h',
      avatar: 'assets/avatar-mago.png'
    },
    {
      usuario: 'Aisbaldo Green',
      acao: 'Manteve a chama acesa por 10 dias',
      tempo: '5h',
      avatar: 'assets/avatar-alquimista.png'
    },
    {
      usuario: 'Isaac Newton',
      acao: 'Foco de mestre',
      tempo: '4h',
      avatar: 'assets/avatar-coruja.png'
    }
  ];

  desafios = [
    {
      id: 1,
      titulo: 'Desafio da guilda:',
      descricao: 'transmutar 5 poções',
      progressoAtual: 8,
      progressoTotal: 15,
      icone: 'flask-outline',
      corIcone: '#a855f7'
    },
    {
      id: 2,
      titulo: 'Desafio da guilda:',
      descricao: 'Manter a chama acesa por 10 dias',
      progressoAtual: 7,
      progressoTotal: 10,
      icone: 'flame-outline',
      corIcone: '#f97316'
    },
    {
      id: 3,
      titulo: 'Desafio da guilda:',
      descricao: 'Evoluir até 50% em Biologia',
      progressoAtual: 30,
      progressoTotal: 50,
      icone: 'leaf-outline',
      corIcone: '#22c55e'
    }
  ];

  rankingGuilda = [
    { posicao: 1, nome: 'Luna Mistifel', xp: '2.450 XP', avatar: 'assets/avatar-mago.png' },
    { posicao: 2, nome: 'Aisbaldo Green', xp: '1.980 XP', avatar: 'assets/avatar-alquimista.png' },
    { posicao: 3, nome: 'Isaac Newton', xp: '1.720 XP', avatar: 'assets/avatar-coruja.png' }
  ];

  constructor(private navCtrl: NavController) {}

  ngOnInit() {}

  segmentChanged(event: any) {
    this.segmentoSelecionado = event.detail.value;
  }

  verDesafio(desafioId: number) {
    console.log('Abrir detalhes do desafio:', desafioId);
  }

  voltar() {
    this.navCtrl.navigateBack('/tabs/tab2')
  }
}