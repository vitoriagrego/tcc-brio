import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

interface Idioma {
  codigo: string;
  nome: string;
  sigla: string;
}

@Component({
  selector: 'app-idioma',
  templateUrl: './idioma.page.html',
  styleUrls: ['./idioma.page.scss'],
  standalone: false
})
export class IdiomaPage implements OnInit {

  idiomas: Idioma[] = [
    { codigo: 'pt', nome: 'Português', sigla: 'PT-BR' },
    { codigo: 'en', nome: 'Inglês', sigla: 'EN-US' },
    { codigo: 'es', nome: 'Espanhol', sigla: 'ES-ES' }
  ];

  idiomaSelecionado: string = 'Português';

  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    this.carregarIdioma();
  }

  carregarIdioma() {
    const salvo = localStorage.getItem('app_idioma');
    if (salvo) {
      this.idiomaSelecionado = salvo;
    }
  }

  selecionarIdioma(nomeIdioma: string) {
    this.idiomaSelecionado = nomeIdioma;
    localStorage.setItem('app_idioma', nomeIdioma);
    // Mais tarde, ao integrar o ngx-translate, adicionaremos aqui:
    // this.translate.use(codigo);
  }

  goBack() {
    this.navCtrl.navigateBack('/config');
  }

}