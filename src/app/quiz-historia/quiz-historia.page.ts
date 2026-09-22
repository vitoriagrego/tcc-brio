import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

interface Pergunta {
  pergunta: string;
  alternativas: string[];
  respostaCorreta: number;
}

@Component({
  selector: 'app-quiz-historia',
  templateUrl: './quiz-historia.page.html',
  styleUrls: ['./quiz-historia.page.scss'],
  standalone: false,
})
export class QuizHistoriaPage implements OnInit {

  materia: string = 'História';

  perguntas: Pergunta[] = [];

  perguntaAtual: number = 0;

  respostaSelecionada: number | null = null;

  pontuacao: number = 0;

  finalizado: boolean = false;

  bancoDePerguntas: { [key: string]: Pergunta[] } = {

    'Matemática': [
      {
        pergunta: 'Quanto é 8 × 7?',
        alternativas: ['54', '56', '64', '48'],
        respostaCorreta: 1
      },
      {
        pergunta: 'Qual é o resultado de 100 ÷ 4?',
        alternativas: ['20', '25', '30', '40'],
        respostaCorreta: 1
      },
      {
        pergunta: 'Quanto é 15 + 27?',
        alternativas: ['40', '41', '42', '43'],
        respostaCorreta: 2
      },
      {
        pergunta: 'Qual é a raiz quadrada de 81?',
        alternativas: ['7', '8', '9', '10'],
        respostaCorreta: 2
      },
      {
        pergunta: 'Quanto é 12²?',
        alternativas: ['124', '144', '122', '154'],
        respostaCorreta: 1
      }
    ],

    'História': [
      {
        pergunta: 'Em que ano ocorreu a Independência do Brasil?',
        alternativas: ['1500', '1789', '1822', '1889'],
        respostaCorreta: 2
      },
      {
        pergunta: 'Quem foi o primeiro imperador do Brasil?',
        alternativas: [
          'Dom Pedro I',
          'Dom Pedro II',
          'Getúlio Vargas',
          'Juscelino Kubitschek'
        ],
        respostaCorreta: 0
      },
      {
        pergunta: 'Qual acontecimento ocorreu em 1889 no Brasil?',
        alternativas: [
          'Independência do Brasil',
          'Proclamação da República',
          'Abolição da escravidão',
          'Chegada da família real'
        ],
        respostaCorreta: 1
      },
      {
        pergunta: 'Quem assinou a Lei Áurea?',
        alternativas: [
          'Princesa Isabel',
          'Dom Pedro I',
          'Getúlio Vargas',
          'Marechal Deodoro'
        ],
        respostaCorreta: 0
      },
      {
        pergunta: 'Qual foi a capital do Brasil antes de Brasília?',
        alternativas: [
          'São Paulo',
          'Salvador',
          'Rio de Janeiro',
          'Belo Horizonte'
        ],
        respostaCorreta: 2
      }
    ],

    'Geografia': [
      {
        pergunta: 'Qual é o maior país da América do Sul em território?',
        alternativas: [
          'Argentina',
          'Brasil',
          'Chile',
          'Peru'
        ],
        respostaCorreta: 1
      },
      {
        pergunta: 'Qual é o maior oceano do planeta?',
        alternativas: [
          'Atlântico',
          'Índico',
          'Pacífico',
          'Ártico'
        ],
        respostaCorreta: 2
      },
      {
        pergunta: 'Qual é a capital do Brasil?',
        alternativas: [
          'São Paulo',
          'Rio de Janeiro',
          'Brasília',
          'Salvador'
        ],
        respostaCorreta: 2
      },
      {
        pergunta: 'Em qual continente fica o Egito?',
        alternativas: [
          'Ásia',
          'África',
          'Europa',
          'Oceania'
        ],
        respostaCorreta: 1
      },
      {
        pergunta: 'Qual linha imaginária divide a Terra em Hemisfério Norte e Sul?',
        alternativas: [
          'Meridiano de Greenwich',
          'Trópico de Capricórnio',
          'Linha do Equador',
          'Trópico de Câncer'
        ],
        respostaCorreta: 2
      }
    ],

    'Biologia': [
      {
        pergunta: 'Qual é a unidade básica dos seres vivos?',
        alternativas: [
          'Átomo',
          'Célula',
          'Tecido',
          'Órgão'
        ],
        respostaCorreta: 1
      },
      {
        pergunta: 'Qual organela é responsável pela produção de energia nas células?',
        alternativas: [
          'Núcleo',
          'Ribossomo',
          'Mitocôndria',
          'Lisossomo'
        ],
        respostaCorreta: 2
      },
      {
        pergunta: 'Qual molécula armazena a informação genética?',
        alternativas: [
          'ATP',
          'DNA',
          'Glicose',
          'Proteína'
        ],
        respostaCorreta: 1
      },
      {
        pergunta: 'Qual sistema é responsável pela circulação do sangue?',
        alternativas: [
          'Sistema digestório',
          'Sistema respiratório',
          'Sistema circulatório',
          'Sistema nervoso'
        ],
        respostaCorreta: 2
      },
      {
        pergunta: 'Qual processo as plantas utilizam para produzir seu alimento?',
        alternativas: [
          'Respiração',
          'Fotossíntese',
          'Digestão',
          'Fermentação'
        ],
        respostaCorreta: 1
      }
    ],

    'Física': [
      {
        pergunta: 'Qual é a unidade de força no Sistema Internacional?',
        alternativas: [
          'Joule',
          'Watt',
          'Newton',
          'Pascal'
        ],
        respostaCorreta: 2
      },
      {
        pergunta: 'Qual é aproximadamente a velocidade da luz no vácuo?',
        alternativas: [
          '300 mil km/s',
          '30 mil km/s',
          '3 mil km/s',
          '3 milhões km/s'
        ],
        respostaCorreta: 0
      },
      {
        pergunta: 'Qual instrumento mede a temperatura?',
        alternativas: [
          'Barômetro',
          'Termômetro',
          'Velocímetro',
          'Amperímetro'
        ],
        respostaCorreta: 1
      },
      {
        pergunta: 'Qual é a unidade de energia no Sistema Internacional?',
        alternativas: [
          'Newton',
          'Joule',
          'Watt',
          'Volt'
        ],
        respostaCorreta: 1
      },
      {
        pergunta: 'Qual grandeza mede a quantidade de matéria de um corpo?',
        alternativas: [
          'Força',
          'Massa',
          'Velocidade',
          'Potência'
        ],
        respostaCorreta: 1
      }
    ],

    'Química': [
      {
        pergunta: 'Qual é o símbolo químico do oxigênio?',
        alternativas: [
          'Ox',
          'O',
          'Og',
          'O₂'
        ],
        respostaCorreta: 1
      },
      {
        pergunta: 'Qual é a fórmula química da água?',
        alternativas: [
          'CO₂',
          'O₂',
          'H₂O',
          'NaCl'
        ],
        respostaCorreta: 2
      },
      {
        pergunta: 'Qual partícula possui carga elétrica negativa?',
        alternativas: [
          'Próton',
          'Nêutron',
          'Elétron',
          'Núcleo'
        ],
        respostaCorreta: 2
      },
      {
        pergunta: 'Qual é o símbolo químico do ouro?',
        alternativas: [
          'Ag',
          'Au',
          'Fe',
          'Go'
        ],
        respostaCorreta: 1
      },
      {
        pergunta: 'O pH 7 indica uma substância:',
        alternativas: [
          'Ácida',
          'Básica',
          'Neutra',
          'Radioativa'
        ],
        respostaCorreta: 2
      }
    ]

  };

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {}

  ngOnInit(): void {

    const materiaRecebida =
      this.route.snapshot.queryParamMap.get('materia');

    if (materiaRecebida) {
      this.materia = materiaRecebida;
    }

    if (!this.bancoDePerguntas[this.materia]) {
      this.materia = 'História';
    }

    this.perguntas = this.bancoDePerguntas[this.materia];

    this.reiniciarQuiz();
  }

  get pergunta(): Pergunta {
    return this.perguntas[this.perguntaAtual];
  }

  selecionarResposta(index: number): void {

    if (this.respostaSelecionada !== null) {
      return;
    }

    this.respostaSelecionada = index;
  }

  proximaPergunta(): void {

    if (this.respostaSelecionada === null) {
      return;
    }

    if (
      this.respostaSelecionada ===
      this.pergunta.respostaCorreta
    ) {
      this.pontuacao++;
    }

    if (
      this.perguntaAtual <
      this.perguntas.length - 1
    ) {

      this.perguntaAtual++;
      this.respostaSelecionada = null;

    } else {

      this.finalizado = true;
    }
  }

  reiniciarQuiz(): void {

    this.perguntaAtual = 0;
    this.respostaSelecionada = null;
    this.pontuacao = 0;
    this.finalizado = false;
  }

  voltar(): void {

    this.navCtrl.navigateRoot('/materias');

  }
}