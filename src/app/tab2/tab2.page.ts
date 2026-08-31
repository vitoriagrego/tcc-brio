import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page {

  constructor(private navCtrl: NavController) {}

  abrirEstante() {
    this.navCtrl.navigateForward('/materias');
  }

  abrirGuilda() {
    this.navCtrl.navigateForward('/guildas');
  }

  abrirIA() {
    this.navCtrl.navigateForward('/ia');
  }

  abrirLivroMesa() {
    this.navCtrl.navigateForward('/grim1');
  }

}