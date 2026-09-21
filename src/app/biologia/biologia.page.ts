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
  selector: 'app-biologia',
  templateUrl: './biologia.page.html',
  styleUrls: ['./biologia.page.scss'],
  standalone: false,
})
export class BiologiaPage implements OnInit {

  // Modal / Card sobreposto
  blocoAtivo: BlocoAssunto | null = null;

  exibirModal: boolean = false;


  // Lista de Blocos de Assuntos de Biologia
  blocosBiologia: BlocoAssunto[] = [

    {
      id: 'b1',
      titulo: 'CITOLOGIA',
      subtitulo: 'Células e suas estruturas',
      concluido: false,
      conteudo:
        'A Citologia é a área da Biologia que estuda as células. A célula é a unidade básica dos seres vivos. As células podem ser classificadas em procariontes, que não possuem núcleo delimitado por membrana, e eucariontes, que possuem núcleo definido. Entre as principais estruturas celulares estão a membrana plasmática, o citoplasma e o material genético.'
    },

    {
      id: 'b2',
      titulo: 'GENÉTICA',
      subtitulo: 'DNA, genes e hereditariedade',
      concluido: false,
      conteudo:
        'A Genética estuda a hereditariedade e a transmissão das características dos seres vivos. O DNA é a molécula que armazena as informações genéticas. Os genes são segmentos do DNA que contêm informações relacionadas às características dos organismos. Os cromossomos são estruturas formadas principalmente por DNA e proteínas.'
    },

    {
      id: 'b3',
      titulo: 'ECOLOGIA',
      subtitulo: 'Seres vivos e meio ambiente',
      concluido: false,
      conteudo:
        'A Ecologia estuda as relações entre os seres vivos e o ambiente em que vivem. Alguns conceitos importantes são população, comunidade, ecossistema e biosfera. As cadeias alimentares representam a transferência de matéria e energia entre os organismos de um ecossistema.'
    },

    {
      id: 'b4',
      titulo: 'ANATOMIA HUMANA',
      subtitulo: 'Estrutura do corpo humano',
      concluido: false,
      conteudo:
        'A Anatomia Humana estuda a estrutura do corpo humano. O organismo é formado por células, tecidos, órgãos e sistemas. Entre os principais sistemas estão o sistema nervoso, respiratório, circulatório, digestório, urinário e muscular.'
    },

    {
      id: 'b5',
      titulo: 'EVOLUÇÃO',
      subtitulo: 'Origem e diversidade dos seres vivos',
      concluido: false,
      conteudo:
        'A evolução biológica explica as mudanças nas características das populações de seres vivos ao longo das gerações. A seleção natural é um dos principais mecanismos evolutivos. Organismos com características que favorecem sua sobrevivência e reprodução podem deixar mais descendentes.'
    },

    {
      id: 'b6',
      titulo: 'FISIOLOGIA',
      subtitulo: 'Funcionamento do organismo',
      concluido: false,
      conteudo:
        'A Fisiologia estuda o funcionamento dos organismos vivos e de seus sistemas. No corpo humano, os diferentes sistemas trabalham de maneira integrada para manter o funcionamento adequado do organismo e o equilíbrio interno, chamado de homeostase.'
    }

  ];


  constructor(
    private navCtrl: NavController
  ) { }


  ngOnInit(): void {
  }


  // ABRIR BLOCO
  abrirBloco(bloco: BlocoAssunto): void {

    this.blocoAtivo = bloco;

    this.exibirModal = true;

  }


  // FECHAR MODAL
  fecharModal(): void {

    this.exibirModal = false;

    this.blocoAtivo = null;

  }


  // CONCLUIR ESTUDO
  concluirEstudo(): void {

    if (this.blocoAtivo) {

      this.blocoAtivo.concluido = true;

      this.fecharModal();

    }

  }


  // VOLTAR PARA A PÁGINA DE MATÉRIAS
  voltar(): void {

    this.navCtrl.navigateBack('/materias');

  }

}