import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase';

interface Pergunta {
  id?: string;
  pergunta: string;
  alternativas: string[];
  respostaCorreta: number;
  xp: number; // Quantidade de XP concedida ao acertar
}

@Component({
  selector: 'app-quiz-historia',
  templateUrl: './quiz-historia.page.html',
  styleUrls: ['./quiz-historia.page.scss'],
  standalone: false,
})
export class QuizHistoriaPage implements OnInit {

  materia: string = 'História';
  materiaId: string | null = null;

  perguntas: Pergunta[] = [];
  perguntaAtual: number = 0;
  respostaSelecionada: number | null = null;
  pontuacao: number = 0;
  finalizado: boolean = false;
  carregando: boolean = true;

  private bancoDePerguntasLocal: { [key: string]: Pergunta[] } = {
    'Matemática': [
      { pergunta: 'Quanto é 8 × 7?', alternativas: ['54', '56', '64', '48'], respostaCorreta: 1, xp: 10 },
      { pergunta: 'Qual é o resultado de 100 ÷ 4?', alternativas: ['20', '25', '30', '40'], respostaCorreta: 1, xp: 10 },
      { pergunta: 'Quanto é 15 + 27?', alternativas: ['40', '41', '42', '43'], respostaCorreta: 2, xp: 10 },
      { pergunta: 'Qual é a raiz quadrada de 81?', alternativas: ['7', '8', '9', '10'], respostaCorreta: 2, xp: 15 },
      { pergunta: 'Quanto é 12²?', alternativas: ['124', '144', '122', '154'], respostaCorreta: 1, xp: 15 }
    ],
    'História': [
      { pergunta: 'Em que ano ocorreu a Independência do Brasil?', alternativas: ['1500', '1789', '1822', '1889'], respostaCorreta: 2, xp: 10 },
      { pergunta: 'Quem foi o primeiro imperador do Brasil?', alternativas: ['Dom Pedro I', 'Dom Pedro II', 'Getúlio Vargas', 'Juscelino Kubitschek'], respostaCorreta: 0, xp: 10 },
      { pergunta: 'Qual acontecimento ocorreu em 1889 no Brasil?', alternativas: ['Independência do Brasil', 'Proclamação da República', 'Abolição da escravidão', 'Chegada da família real'], respostaCorreta: 1, xp: 10 },
      { pergunta: 'Quem assinou a Lei Áurea?', alternativas: ['Princesa Isabel', 'Dom Pedro I', 'Getúlio Vargas', 'Marechal Deodoro'], respostaCorreta: 0, xp: 10 },
      { pergunta: 'Qual foi a capital do Brasil antes de Brasília?', alternativas: ['São Paulo', 'Salvador', 'Rio de Janeiro', 'Belo Horizonte'], respostaCorreta: 2, xp: 10 }
    ],
    'Geografia': [
      { pergunta: 'Qual é o maior país da América do Sul em território?', alternativas: ['Argentina', 'Brasil', 'Chile', 'Peru'], respostaCorreta: 1, xp: 10 },
      { pergunta: 'Qual é o maior oceano do planeta?', alternativas: ['Atlântico', 'Índico', 'Pacífico', 'Ártico'], respostaCorreta: 2, xp: 10 },
      { pergunta: 'Qual é a capital do Brasil?', alternativas: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'], respostaCorreta: 2, xp: 10 },
      { pergunta: 'Em qual continente fica o Egito?', alternativas: ['Ásia', 'África', 'Europa', 'Oceania'], respostaCorreta: 1, xp: 10 },
      { pergunta: 'Qual linha imaginária divide a Terra em Hemisfério Norte e Sul?', alternativas: ['Meridiano de Greenwich', 'Trópico de Capricórnio', 'Linha do Equador', 'Trópico de Câncer'], respostaCorreta: 2, xp: 15 }
    ],
    'Biologia': [
      { pergunta: 'Qual é a unidade básica dos seres vivos?', alternativas: ['Átomo', 'Célula', 'Tecido', 'Órgão'], respostaCorreta: 1, xp: 10 },
      { pergunta: 'Qual organela é responsável pela produção de energia nas células?', alternativas: ['Núcleo', 'Ribossomo', 'Mitocôndria', 'Lisossomo'], respostaCorreta: 2, xp: 15 },
      { pergunta: 'Qual molécula armazena a informação genética?', alternativas: ['ATP', 'DNA', 'Glicose', 'Proteína'], respostaCorreta: 1, xp: 10 },
      { pergunta: 'Qual sistema é responsável pela circulação do sangue?', alternativas: ['Sistema digestório', 'Sistema respiratório', 'Sistema circulatório', 'Sistema nervoso'], respostaCorreta: 2, xp: 10 },
      { pergunta: 'Qual processo as plantas utilizam para produzir seu alimento?', alternativas: ['Respiração', 'Fotossíntese', 'Digestão', 'Fermentação'], respostaCorreta: 1, xp: 10 }
    ],
    'Física': [
      { pergunta: 'Qual é a unidade de força no Sistema Internacional?', alternativas: ['Joule', 'Watt', 'Newton', 'Pascal'], respostaCorreta: 2, xp: 10 },
      { pergunta: 'Qual é aproximadamente a velocidade da luz no vácuo?', alternativas: ['300 mil km/s', '30 mil km/s', '3 mil km/s', '3 milhões km/s'], respostaCorreta: 0, xp: 15 },
      { pergunta: 'Qual instrumento mede a temperatura?', alternativas: ['Barômetro', 'Termômetro', 'Velocímetro', 'Amperímetro'], respostaCorreta: 1, xp: 10 },
      { pergunta: 'Qual é a unidade de energia no Sistema Internacional?', alternativas: ['Newton', 'Joule', 'Watt', 'Volt'], respostaCorreta: 1, xp: 10 },
      { pergunta: 'Qual grandeza mede a quantidade de matéria de um corpo?', alternativas: ['Força', 'Massa', 'Velocidade', 'Potência'], respostaCorreta: 1, xp: 10 }
    ],
    'Química': [
      { pergunta: 'Qual é o símbolo químico do oxigênio?', alternativas: ['Ox', 'O', 'Og', 'O₂'], respostaCorreta: 1, xp: 10 },
      { pergunta: 'Qual é a fórmula química da água?', alternativas: ['CO₂', 'O₂', 'H₂O', 'NaCl'], respostaCorreta: 2, xp: 10 },
      { pergunta: 'Qual partícula possui carga elétrica negativa?', alternativas: ['Próton', 'Nêutron', 'Elétron', 'Núcleo'], respostaCorreta: 2, xp: 10 },
      { pergunta: 'Qual é o símbolo químico do ouro?', alternativas: ['Ag', 'Au', 'Fe', 'Go'], respostaCorreta: 1, xp: 15 },
      { pergunta: 'O pH 7 indica uma substância:', alternativas: ['Ácida', 'Básica', 'Neutra', 'Radioativa'], respostaCorreta: 2, xp: 10 }
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    const materiaRecebida = this.route.snapshot.queryParamMap.get('materia');
    const materiaIdRecebido = this.route.snapshot.queryParamMap.get('materiaId');

    if (materiaRecebida) {
      this.materia = materiaRecebida;
    }

    if (materiaIdRecebido) {
      this.materiaId = materiaIdRecebido;
    }

    await this.carregarOuPovoarQuestoes();
  }

  private async carregarOuPovoarQuestoes() {
    this.carregando = true;
    try {
      let query = this.supabaseService.client.from('questoes').select('*');

      if (this.materiaId) {
        query = query.eq('materia_id', this.materiaId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro na consulta de questoes:', error.message);
        this.usarPerguntasFallback();
        return;
      }

      if (data && data.length > 0) {
        console.log(`✅ ${data.length} questões carregadas para ${this.materia}`);
        this.mapearQuestoes(data);
      } else {
        console.log(`⚡ Nenhuma questão encontrada para ${this.materia}. Inserindo dados locais...`);
        this.usarPerguntasFallback();
        await this.povoarTabelaQuestoes();
      }
    } catch (err) {
      console.error('❌ Erro de conexão ao carregar questões:', err);
      this.usarPerguntasFallback();
    } finally {
      this.carregando = false;
      this.reiniciarQuiz();
    }
  }

  private usarPerguntasFallback() {
    const chaveMateria = this.bancoDePerguntasLocal[this.materia] ? this.materia : 'História';
    this.perguntas = [...this.bancoDePerguntasLocal[chaveMateria]];
  }

  private async povoarTabelaQuestoes() {
    const listaLocal = this.bancoDePerguntasLocal[this.materia] || this.bancoDePerguntasLocal['História'];

    const questoesParaInserir = listaLocal.map(q => ({
      materia_id: this.materiaId || null,
      pergunta: q.pergunta,
      opcoes: q.alternativas,
      resposta_correta: q.alternativas[q.respostaCorreta],
      xp: q.xp || 10
    }));

    const { data, error } = await this.supabaseService.client
      .from('questoes')
      .insert(questoesParaInserir)
      .select();

    if (error) {
      console.error('❌ Erro ao povoar a tabela questoes:', error.message, error.details);
    } else if (data && data.length > 0) {
      console.log(`✅ Tabela questoes povoada com sucesso com valores de XP!`, data);
      this.mapearQuestoes(data);
    }
  }

  private mapearQuestoes(dados: any[]) {
    this.perguntas = dados.map(q => {
      const opcoesArray: string[] = Array.isArray(q.opcoes) ? q.opcoes : [];
      let idxCorreto = opcoesArray.indexOf(q.resposta_correta);
      if (idxCorreto === -1) idxCorreto = 0;

      return {
        id: q.id,
        pergunta: q.pergunta,
        alternativas: opcoesArray,
        respostaCorreta: idxCorreto,
        xp: q.xp || 10
      };
    });
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

  async proximaPergunta(): Promise<void> {
    if (this.respostaSelecionada === null) {
      return;
    }

    const acertou = this.respostaSelecionada === this.pergunta.respostaCorreta;

    if (acertou) {
      this.pontuacao++;
      // Adiciona o XP no perfil do usuário ao acertar
      await this.adicionarXpAoPerfil(this.pergunta.xp || 10);
    }

    await this.salvarRespostaNoBanco(acertou);

    if (this.perguntaAtual < this.perguntas.length - 1) {
      this.perguntaAtual++;
      this.respostaSelecionada = null;
    } else {
      this.finalizado = true;
    }
  }

  // =====================================================
  // ADICIONA O XP DA QUESTÃO AO PERFIL E ATUALIZA O NÍVEL
  // =====================================================
  private async adicionarXpAoPerfil(xpGanha: number) {
    try {
      let user = await this.supabaseService.getUsuarioAtual();
      if (!user) {
        const { data: { session } } = await this.supabaseService.client.auth.getSession();
        user = session?.user || null;
      }

      if (!user) {
        console.warn('⚠️ Usuário não autenticado. XP não será computado no perfil.');
        return;
      }

      // 1. Busca os dados atuais do perfil (XP e nível)
      const { data: perfil, error: fetchError } = await this.supabaseService.client
        .from('profiles')
        .select('xp, nivel')
        .eq('id', user.id)
        .single();

      if (fetchError || !perfil) {
        console.error('❌ Erro ao buscar perfil para adicionar XP:', fetchError?.message);
        return;
      }

      const xpAtual = perfil.xp || 0;
      const novoXp = xpAtual + xpGanha;

      // 2. Regra de nível: A cada 100 XP o usuário sobe 1 Nível
      const novoNivel = Math.floor(novoXp / 100) + 1;

      // 3. Atualiza na tabela 'profiles'
      const { error: updateError } = await this.supabaseService.client
        .from('profiles')
        .update({
          xp: novoXp,
          nivel: novoNivel,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar XP/Nível no perfil:', updateError.message);
      } else {
        console.log(`🎉 +${xpGanha} XP adicionados! Novo XP Total: ${novoXp} | Novo Nível: ${novoNivel}`);
      }
    } catch (err) {
      console.error('❌ Erro ao processar XP do perfil:', err);
    }
  }

  private async salvarRespostaNoBanco(acertou: boolean) {
    try {
      let userId: string | null = null;
      try {
        const user = await this.supabaseService.getUsuarioAtual();
        if (user?.id) {
          userId = user.id;
        } else {
          const { data: { session } } = await this.supabaseService.client.auth.getSession();
          userId = session?.user?.id || null;
        }
      } catch (e) {
        console.warn('⚠️ Usuário não autenticado.');
      }

      const textoResposta = this.pergunta.alternativas[this.respostaSelecionada!];

      const payload: any = {
        resposta_usuario: textoResposta,
        acertou: acertou
      };

      if (this.pergunta?.id) payload.questao_id = this.pergunta.id;
      if (userId) payload.user_id = userId;
      if (this.materiaId) payload.materia_id = this.materiaId;

      const { data, error } = await this.supabaseService.client
        .from('historico_quizzes')
        .insert([payload])
        .select();

      if (error) {
        console.error('❌ Erro Supabase:', error.message, error.details);
      } else {
        console.log('✅ Tentativa registrada no historico_quizzes!', data);
      }
    } catch (err) {
      console.error('❌ Erro ao salvar histórico:', err);
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