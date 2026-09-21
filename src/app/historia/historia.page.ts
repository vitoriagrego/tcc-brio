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
  selector: 'app-historia',
  templateUrl: './historia.page.html',
  styleUrls: ['./historia.page.scss'],
  standalone: false,
})
export class HistoriaPage implements OnInit {

  blocoAtivo: BlocoAssunto | null = null;
  exibirModal: boolean = false;

  blocosHistoria: BlocoAssunto[] = [
    {
      id: 'h1',
      titulo: 'GRÉCIA E ROMA ANTIGA',
      subtitulo: 'Democracia, República e Império',
      concluido: false,
      conteudo: 'Na Grécia Antiga, destaca-se Atenas com o nascimento da democracia direta e Esparta com foco militar. Em Roma, viveu-se a transição da Monarquia para a República e, em seguida, para o Império, deixando legados fundamentais no Direito, Arquitetura e Política.'
    },
    {
      id: 'h2',
      titulo: 'FEUDALISMO E IDADE MÉDIA',
      subtitulo: 'Sociedade Estamental e Igreja',
      concluido: false,
      conteudo: 'A Idade Média foi marcada pela descentralização do poder no Feudalismo, laços de suserania e vassalagem, e pelo forte domínio cultural e econômico da Igreja Católica. No final do período, destacam-se as Cruzadas e o renascimento comercial e urbano.'
    },
    {
      id: 'h3',
      titulo: 'REVOLUÇÃO INDUSTRIAL',
      subtitulo: 'Transformações Sociais e Econômicas',
      concluido: false,
      conteudo: 'Iniciada na Inglaterra no século XVIII, a Revolução Industrial substituiu o trabalho artesanal pelas máquinas a vapor. Esse processo consolidou o Capitalismo, criou a divisão entre burguesia e proletariado e acelerou a urbanização.'
    },
    {
      id: 'h4',
      titulo: 'BRASIL COLÔNIA E IMPÉRIO',
      subtitulo: 'Ciclos Econômicos e Independência',
      concluido: false,
      conteudo: 'O período colonial baseou-se na monocultura latifundiária, escravidão e ciclos econômicos (Pau-Brasil, Açúcar e Ouro). Em 1822 ocorreu a Independência do Brasil, iniciando o Período Imperial (Primeiro Reinado, Regência e Segundo Reinado) até a Proclamação da República em 1889.'
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