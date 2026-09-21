import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

interface BlocoAssunto {
  id: string;
  titulo: string;
  subtitulo: string;
  concluido: boolean;
  conteudo: string;
}

@Component({
  selector: 'app-geografia',
  templateUrl: './geografia.page.html',
  styleUrls: ['./geografia.page.scss'],
  standalone: false,
})
export class GeografiaPage implements OnInit {

  blocoAtivo: BlocoAssunto | null = null;
  exibirModal: boolean = false;

  blocosGeografia: BlocoAssunto[] = [
    {
      id: 'g1',
      titulo: 'CARTOGRAFIA E ESCALAS',
      subtitulo: 'Projeções e Coordenadas',
      concluido: false,
      conteudo: 'A Cartografia estuda a representação da superfície terrestre. Coordenadas geográficas usam Latitudes (linhas horizontais/Equador) e Longitudes (linhas verticais/Greenwich). Escalas indicam a proporção entre a medida real e a representada no mapa.'
    },
    {
      id: 'g2',
      titulo: 'GEOMORFOLOGIA',
      subtitulo: 'Relevo e Tectônica de Placas',
      concluido: false,
      conteudo: 'A litosfera é dividida em placas tectônicas que se movimentam sobre a astenosfera. Esse movimento gera terremotos, vulcanismo e a formação de montanhas (orogênese). O relevo é modelado por agentes internos (endógenos) e externos (exógenos, como erosão).'
    },
    {
      id: 'g3',
      titulo: 'CLIMATOLOGIA',
      subtitulo: 'Massas de Ar e Mudanças Climáticas',
      concluido: false,
      conteudo: 'O clima é a sucessão dos tipos de tempo ao longo dos anos. Os elementos climáticos (temperatura, umidade, pressão) são influenciados por fatores como altitude, latitude, continentalidade e massas de ar.'
    },
    {
      id: 'g4',
      titulo: 'GEOGRAFIA URBANA',
      subtitulo: 'Urbanização e Metropolização',
      concluido: false,
      conteudo: 'O processo de urbanização intensificou-se com a Revolução Industrial. Conceitos chave incluem a conurbação (junção física de duas cidades), segregação socioespacial e a criação de regiões metropolitanas e megalópoles.'
    }
  ];

  constructor(private navCtrl: NavController) { }

  ngOnInit() { }

  abrirBloco(bloco: BlocoAssunto) {
    this.blocoAtivo = bloco;
    this.exibirModal = true;
  }

  fecharModal() {
    this.exibirModal = false;
    this.blocoAtivo = null;
  }

  concluirEstudo() {
    if (this.blocoAtivo) {
      this.blocoAtivo.concluido = true;
      this.fecharModal();
    }
  }

  voltar() {
    this.navCtrl.navigateBack('/materias');
  }
}