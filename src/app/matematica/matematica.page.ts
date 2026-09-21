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
  selector: 'app-estudo-matematica',
  templateUrl: './matematica.page.html',
  styleUrls: ['./matematica.page.scss'],
  standalone: false,
})
export class MatematicaPage implements OnInit {

  // Modal / Card sobreposto
  blocoAtivo: BlocoAssunto | null = null;
  exibirModal: boolean = false;

  // Lista de Blocos de Assuntos de Matemática
  blocosMatematica: BlocoAssunto[] = [
    {
      id: 'm1',
      titulo: 'EQUAÇÕES DE 2º GRAU',
      subtitulo: 'Fórmula de Bhaskara e Delta',
      concluido: true,
      conteudo: 'A equação do 2º grau é representada por ax² + bx + c = 0. Para resolver, calculamos primeiro o Delta (Δ = b² - 4ac). Se Δ ≥ 0, encontramos as raízes reais usando a fórmula: x = (-b ± √Δ) / 2a.'
    },
    {
      id: 'm2',
      titulo: 'TRIGONOMETRIA BÁSICA',
      subtitulo: 'Seno, Cosseno e Tangente',
      concluido: false,
      conteudo: 'No triângulo retângulo: Seno (sin) é o Cateto Oposto dividido pela Hipotenusa. Cosseno (cos) é o Cateto Adjacente dividido pela Hipotenusa. Tangente (tan) é o Cateto Oposto dividido pelo Cateto Adjacente.'
    },
    {
      id: 'm3',
      titulo: 'GEOMETRIA PLANA',
      subtitulo: 'Áreas e Perímetros',
      concluido: false,
      conteudo: 'O perímetro é a soma dos lados de uma figura. A área mede a superfície: Quadrado (A = lado²), Retângulo (A = base × altura), Triângulo (A = (base × altura) / 2) e Círculo (A = π × r²).'
    },
    {
      id: 'm4',
      titulo: 'FUNÇÕES AFIM E QUADRÁTICA',
      subtitulo: 'Gráficos e Domínio',
      concluido: false,
      conteudo: 'A função afim (1º grau) tem formato f(x) = ax + b e seu gráfico é uma reta. A função quadrática (2º grau) tem formato f(x) = ax² + bx + c e seu gráfico é uma parábola.'
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