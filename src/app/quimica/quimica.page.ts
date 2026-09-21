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
  selector: 'app-quimica',
  templateUrl: './quimica.page.html',
  styleUrls: ['./quimica.page.scss'],
  standalone: false,
})
export class QuimicaPage implements OnInit {

  // Modal / Card sobreposto
  blocoAtivo: BlocoAssunto | null = null;

  exibirModal: boolean = false;


  // Lista de Blocos de Assuntos de Química
  blocosQuimica: BlocoAssunto[] = [

    {
      id: 'q1',
      titulo: 'ESTRUTURA ATÔMICA',
      subtitulo: 'Átomos, prótons, nêutrons e elétrons',
      concluido: false,
      conteudo:
        'O átomo é a unidade básica da matéria. Ele é formado por um núcleo, que contém prótons e nêutrons, e por elétrons que se encontram ao redor do núcleo. Os prótons possuem carga positiva, os elétrons possuem carga negativa e os nêutrons não possuem carga elétrica.'
    },

    {
      id: 'q2',
      titulo: 'TABELA PERIÓDICA',
      subtitulo: 'Elementos químicos e propriedades',
      concluido: false,
      conteudo:
        'A Tabela Periódica organiza os elementos químicos de acordo com o número atômico e suas propriedades. As linhas são chamadas de períodos e as colunas são chamadas de grupos ou famílias. Elementos de uma mesma família apresentam propriedades químicas semelhantes.'
    },

    {
      id: 'q3',
      titulo: 'LIGAÇÕES QUÍMICAS',
      subtitulo: 'Iônica, covalente e metálica',
      concluido: false,
      conteudo:
        'As ligações químicas são interações que mantêm os átomos unidos. A ligação iônica ocorre geralmente entre metais e ametais com transferência de elétrons. A ligação covalente ocorre pelo compartilhamento de elétrons. A ligação metálica ocorre entre átomos de metais.'
    },

    {
      id: 'q4',
      titulo: 'REAÇÕES QUÍMICAS',
      subtitulo: 'Transformações da matéria',
      concluido: false,
      conteudo:
        'Uma reação química ocorre quando uma ou mais substâncias são transformadas em novas substâncias. As substâncias presentes inicialmente são chamadas de reagentes e as substâncias formadas são chamadas de produtos. As reações podem apresentar diferentes evidências, como mudança de cor, formação de gás ou alteração de temperatura.'
    },

    {
      id: 'q5',
      titulo: 'FUNÇÕES INORGÂNICAS',
      subtitulo: 'Ácidos, bases, sais e óxidos',
      concluido: false,
      conteudo:
        'As principais funções inorgânicas são ácidos, bases, sais e óxidos. Os ácidos apresentam características específicas, assim como as bases. Os sais podem ser formados, por exemplo, por reações entre ácidos e bases. Os óxidos são compostos formados por oxigênio ligado a outro elemento.'
    },

    {
      id: 'q6',
      titulo: 'QUÍMICA ORGÂNICA',
      subtitulo: 'Compostos que possuem carbono',
      concluido: false,
      conteudo:
        'A Química Orgânica é o ramo da Química que estuda principalmente os compostos que possuem carbono. Entre os principais grupos estão os hidrocarbonetos, álcoois, aldeídos, cetonas, ácidos carboxílicos e ésteres.'
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