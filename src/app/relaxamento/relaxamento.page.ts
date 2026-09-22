import { Component} from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-config',
  templateUrl: './relaxamento.page.html',
  styleUrls: ['./relaxamento.page.scss'],
  standalone: false
})
export class RelaxamentoPage {

  sonsAtivado: string = 'Ativado';

  constructor(
    private navCtrl: NavController,
    private alertController: AlertController
  ) {}

  ionViewWillEnter() {
    this.carregarConfiguracoes();
  }

  carregarConfiguracoes() {
    const sons = localStorage.getItem('app_sons');
    this.sonsAtivado = sons !== null ? (sons === 'true' ? 'Ativado' : 'Desativado') : 'Ativado';
  }

  // Voltar para a tela anterior
  goBack() {
    this.navCtrl.navigateBack('/tabs/tab1');
  };

}