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
  selector: 'app-fisica',
  templateUrl: './fisica.page.html',
  styleUrls: ['./fisica.page.scss'],
  standalone: false,
})
export class FisicaPage implements OnInit {

  // Modal / Card sobreposto
  blocoAtivo: BlocoAssunto | null = null;

  exibirModal: boolean = false;


  // Lista de Blocos de Assuntos de Física
  blocosFisica: BlocoAssunto[] = [

    {
      id: 'f1',
      titulo: 'CINEMÁTICA',
      subtitulo: 'Movimento, velocidade e aceleração',
      concluido: false,
      conteudo:
        'A Cinemática é a parte da Física que estuda os movimentos dos corpos sem analisar suas causas. Os principais conceitos são posição, deslocamento, velocidade e aceleração. No movimento uniforme, a velocidade permanece constante. No movimento uniformemente variado, existe uma aceleração constante.'
    },

    {
      id: 'f2',
      titulo: 'LEIS DE NEWTON',
      subtitulo: 'Força e movimento',
      concluido: false,
      conteudo:
        'As Leis de Newton explicam a relação entre força e movimento. A Primeira Lei, ou princípio da inércia, afirma que um corpo tende a manter seu estado de movimento quando a força resultante é zero. A Segunda Lei relaciona força, massa e aceleração pela expressão F = m · a. A Terceira Lei afirma que para toda ação existe uma reação de mesma intensidade e direção, mas sentido oposto.'
    },

    {
      id: 'f3',
      titulo: 'TRABALHO E ENERGIA',
      subtitulo: 'Transformação e conservação da energia',
      concluido: false,
      conteudo:
        'O trabalho de uma força está relacionado à transferência de energia causada por essa força. A energia cinética está associada ao movimento de um corpo, enquanto a energia potencial está relacionada à posição ou configuração do corpo. Em sistemas ideais, a energia total pode ser conservada, sendo transformada de uma forma para outra.'
    },

    {
      id: 'f4',
      titulo: 'TERMOLOGIA',
      subtitulo: 'Temperatura e calor',
      concluido: false,
      conteudo:
        'A Termologia estuda os fenômenos relacionados ao calor e à temperatura. Temperatura está relacionada ao grau de agitação das partículas de um corpo. Calor é a energia térmica transferida entre corpos devido a uma diferença de temperatura. Os principais processos de propagação do calor são condução, convecção e radiação.'
    },

    {
      id: 'f5',
      titulo: 'ONDULATÓRIA',
      subtitulo: 'Ondas e seus fenômenos',
      concluido: false,
      conteudo:
        'A Ondulatória estuda as ondas e suas características. Uma onda é uma perturbação que pode transportar energia de um ponto para outro. Entre suas principais características estão frequência, período, comprimento de onda e velocidade. As ondas podem apresentar fenômenos como reflexão, refração, difração e interferência.'
    },

    {
      id: 'f6',
      titulo: 'ELETRICIDADE',
      subtitulo: 'Corrente, tensão e resistência',
      concluido: false,
      conteudo:
        'A Eletricidade estuda os fenômenos relacionados às cargas elétricas. A corrente elétrica representa o movimento ordenado de cargas. A tensão elétrica está relacionada à diferença de potencial entre dois pontos. A resistência elétrica representa a oposição à passagem da corrente. A relação entre essas grandezas pode ser descrita pela Lei de Ohm: U = R · i.'
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