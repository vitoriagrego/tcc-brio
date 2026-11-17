import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, AlertController, ToastController, NavController } from '@ionic/angular';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

interface Message {
  id?: string;
  sender: 'user' | 'ai';
  text: string;
  created_at?: string;
}

export interface IaPreferencias {
  user_id?: string;
  materias_foco: string[];
  horario_preferido: string;
  meta_horas_dia: number;
  tecnica_preferida: string;
  observacoes: string;
}

@Component({
  selector: 'app-ia',
  templateUrl: 'ia.page.html',
  styleUrls: ['ia.page.scss'],
  standalone: false,
})
export class IaPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  // Supabase Client
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  userId: string | null = null;
  userEmail: string | null = null;
  planoUsuario: 'gratis' | 'premium' = 'gratis';

  userInput: string = '';
  isLoading: boolean = false;
  gerandoRelatorio: boolean = false;
  carregandoHistorico: boolean = true;

  // Modal de Relatório Semanal
  modalRelatorioAberto: boolean = false;
  relatorioConteudo: string = '';
  relatorioSemana: string = '';

  // Modal de Preferências
  modalPreferenciasAberto: boolean = false;
  preferencias: IaPreferencias = {
    materias_foco: ['Matemática', 'História'],
    horario_preferido: 'Noite',
    meta_horas_dia: 2,
    tecnica_preferida: 'Pomodoro',
    observacoes: ''
  };

  opcoesMaterias: string[] = ['Matemática', 'História', 'Geografia', 'Biologia', 'Física', 'Química'];
  opcoesHorarios: string[] = ['Manhã', 'Tarde', 'Noite', 'Madrugada'];
  opcoesTecnicas: string[] = ['Pomodoro', 'Feynman', 'Repetição Espaçada', 'Mapas Mentais'];

  messages: Message[] = [];

  // Configurações OpenRouter e Modelos de Alta Disponibilidade
  private apiKey: string = environment.openRouterApiKey;

  // Lista com múltiplos modelos gratuitos para fallback automático caso algum falhe ou retorne vazio
  private readonly modelosDisponiveis: string[] = [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen-2.5-coder-32b-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'baidu/ernie-5.5-flash-preview:free'
  ];

  // Reconhecimento de Voz
  isRecording: boolean = false;
  private recognition: any;

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    await this.inicializarUsuarioEHistorico();
  }

  async ionViewWillEnter() {
    await this.carregarPlanoUsuario();
  }

  // ====================================================================
  // 1. INICIALIZAÇÃO, AUTENTICAÇÃO E CARREGAMENTO DO BANCO SUPABASE
  // ====================================================================
  async inicializarUsuarioEHistorico() {
    this.carregandoHistorico = true;
    try {
      const { data: sess } = await this.supabase.auth.getSession();
      const user = sess.session?.user;

      if (user) {
        this.userId = user.id;
        this.userEmail = user.email || null;
        await Promise.all([
          this.carregarPlanoUsuario(),
          this.carregarPreferenciasEstudo(),
          this.carregarHistoricoMensagens()
        ]);
      } else {
        console.warn('⚠️ Usuário não autenticado. Usando histórico padrão.');
        this.aplicarMensagemInicialPadrao();
      }
    } catch (error) {
      console.error('❌ Erro na inicialização da IA:', error);
      this.aplicarMensagemInicialPadrao();
    } finally {
      this.carregandoHistorico = false;
      this.scrollToBottom();
    }
  }

  async carregarPlanoUsuario() {
    if (!this.userId) return;
    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('plano')
        .eq('id', this.userId)
        .maybeSingle();

      if (!error && profile) {
        this.planoUsuario = (profile.plano === 'premium') ? 'premium' : 'gratis';
      }
    } catch (err) {
      console.error('Erro ao verificar plano:', err);
    }
  }

  async carregarHistoricoMensagens() {
    if (!this.userId) return;

    try {
      const { data, error } = await this.supabase
        .from('ia_mensagens')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar ia_mensagens:', error.message);
        this.aplicarMensagemInicialPadrao();
        return;
      }

      if (data && data.length > 0) {
        // Filtra possíveis mensagens de erro antigas salvas
        this.messages = data
          .filter((item: any) => !item.content.startsWith('Não consegui processar sua mensagem'))
          .map((item: any) => ({
            id: item.id,
            sender: item.role === 'user' ? 'user' : 'ai',
            text: item.content,
            created_at: item.created_at
          }));

        if (this.messages.length === 0) {
          this.aplicarMensagemInicialPadrao();
        }
      } else {
        this.aplicarMensagemInicialPadrao();
      }
    } catch (err) {
      console.error('❌ Erro ao carregar mensagens:', err);
      this.aplicarMensagemInicialPadrao();
    }
  }

  async carregarPreferenciasEstudo() {
    if (!this.userId) return;

    try {
      const { data, error } = await this.supabase
        .from('ia_preferencias')
        .select('*')
        .eq('user_id', this.userId)
        .maybeSingle();

      if (error) {
        console.warn('Preferências não encontradas:', error.message);
        return;
      }

      if (data) {
        this.preferencias = {
          materias_foco: data.materias_foco || [],
          horario_preferido: data.horario_preferido || 'Noite',
          meta_horas_dia: data.meta_horas_dia ? Number(data.meta_horas_dia) : 2,
          tecnica_preferida: data.tecnica_preferida || 'Pomodoro',
          observacoes: data.observacoes || ''
        };
      }
    } catch (err) {
      console.error('Erro ao carregar preferências:', err);
    }
  }

  private aplicarMensagemInicialPadrao() {
    if (this.messages.length === 0) {
      this.messages = [
        { 
          sender: 'ai', 
          text: 'Saudações, nobre estudante! Sou o "Espírito Alquímico", seu mentor virtual.\n\nEstou aqui para transmutar seus hábitos de estudo em alta performance acadêmica.\n\nQual matéria ou rotina gostaria de aprimorar hoje?' 
        }
      ];
    }
  }

  private obterSystemPrompt(): string {
    const foco = this.preferencias.materias_foco.length > 0 
      ? this.preferencias.materias_foco.join(', ') 
      : 'Geral';

    return `Você é o "Espírito Alquímico", um mentor e guia de estudos inteligente, empático e prático. Suas respostas devem ser concisas, formatadas para leitura rápida no celular.

INFORMAÇÕES DO ESTUDANTE:
- Matérias prioritárias: ${foco}
- Horário preferido: ${this.preferencias.horario_preferido}
- Meta diária: ${this.preferencias.meta_horas_dia} hora(s)
- Técnica de estudo favorita: ${this.preferencias.tecnica_preferida}
${this.preferencias.observacoes ? `- Observações pessoais: ${this.preferencias.observacoes}` : ''}

DIRETRIZES DE RESPOSTA:
1. MENTOR ACADÊMICO: Quando o estudante pedir um tema (ex: "gametas biológicas", "física ondulatória", "revolução industrial"), elabore um Roteiro de Estudo Prático com tópicos-chave para memorizar, perguntas reflexivas para fixação e sugestões práticas de como aplicar a técnica ${this.preferencias.tecnica_preferida}.
2. MOTIVAÇÃO E EMPATIA: Use linguagem encorajadora, com tom alquímico sutil e acolhedor.
3. CONCISÃO MOBILE: Use tópicos (bullets), negrito e parágrafos curtos.
4. PERGUNTA SOCRÁTICA FINAL: Conclua sempre propondo uma pergunta para o aluno dar o primeiro passo agora mesmo.`;
  }

  // ====================================================================
  // REQUISIÇÃO ROBUSTA COM FALLBACK AUTOMÁTICO DE MODELOS
  // ====================================================================
  private async chamarIAComFallback(payloadMessages: any[], maxTokens = 1200): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error('Chave da API OpenRouter não configurada no environment.');
    }

    const headers = {
      'Authorization': `Bearer ${this.apiKey.trim()}`,
      'HTTP-Referer': 'https://brio-alquimia.app',
      'X-Title': 'Espirito Alquimico',
      'Content-Type': 'application/json'
    };

    let ultimoErro = 'Nenhum modelo respondeu';

    // 1. Tenta a chamada passando a lista de modelos nativa do OpenRouter
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          models: this.modelosDisponiveis,
          messages: payloadMessages,
          temperature: 0.7,
          max_tokens: maxTokens
        })
      });

      if (response.ok) {
        const data = await response.json();
        const texto = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text;
        if (texto && typeof texto === 'string' && texto.trim() !== '') {
          return texto.trim();
        }
      }
    } catch (e: any) {
      console.warn('Tentativa com array de models falhou, iniciando loop individual:', e);
    }

    // 2. Loop individual resiliente caso a chamada combinada não retorne conteúdo
    for (const model of this.modelosDisponiveis) {
      try {
        console.log(`Tentando modelo: ${model}...`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            model: model,
            messages: payloadMessages,
            temperature: 0.7,
            max_tokens: maxTokens
          })
        });

        if (!response.ok) {
          const erroData = await response.json().catch(() => ({}));
          ultimoErro = erroData?.error?.message || `Status HTTP ${response.status}`;
          console.warn(`Modelo ${model} retornou erro:`, ultimoErro);
          continue;
        }

        const data = await response.json();
        const texto = data?.choices?.[0]?.message?.content 
                   || data?.choices?.[0]?.message?.reasoning 
                   || data?.choices?.[0]?.text;

        if (texto && typeof texto === 'string' && texto.trim() !== '') {
          console.log(`✅ Sucesso com o modelo: ${model}`);
          return texto.trim();
        } else {
          console.warn(`Modelo ${model} retornou texto vazio.`);
        }
      } catch (err: any) {
        ultimoErro = err.message || 'Falha de conexão';
        console.warn(`Exceção com modelo ${model}:`, err);
      }
    }

    throw new Error(`Não foi possível obter resposta dos provedores de IA. Detalhes: ${ultimoErro}`);
  }

  // ====================================================================
  // 2. ENVIO DE MENSAGENS COM SALVAMENTO NO BANCO SUPABASE
  // ====================================================================
  sendMessageOnEnter(event: any) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const prompt = this.userInput.trim();
    this.userInput = '';

    // Adiciona a mensagem do usuário no chat
    const userMsg: Message = { sender: 'user', text: prompt, created_at: new Date().toISOString() };
    this.messages.push(userMsg);
    this.isLoading = true;
    this.scrollToBottom();

    // Salva a mensagem do usuário no banco ia_mensagens
    await this.salvarMensagemNoBanco('user', prompt);

    // Prepara as mensagens recentes (excluindo mensagens de erro para não poluir a IA)
    const mensagensFiltradas = this.messages
      .filter(m => !m.text.startsWith('Não consegui processar sua mensagem') && !m.text.includes('Erro HTTP'))
      .slice(-8)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    const payloadMessages = [
      { role: 'system', content: this.obterSystemPrompt() },
      ...mensagensFiltradas
    ];

    try {
      const replyText = await this.chamarIAComFallback(payloadMessages, 1200);

      this.messages.push({
        sender: 'ai',
        text: replyText,
        created_at: new Date().toISOString()
      });

      // Salva a resposta da IA no Supabase
      await this.salvarMensagemNoBanco('assistant', replyText);

    } catch (error: any) {
      console.error('Erro ao processar mensagem com IA:', error);

      // Exibe mensagem de erro apenas localmente (NÃO salva no banco para não quebrar mensagens futuras)
      this.messages.push({
        sender: 'ai',
        text: `Não consegui transmutar sua resposta no momento.\n\nDetalhes: ${error.message || 'Verifique sua conexão ou tente novamente em instantes.'}`,
        created_at: new Date().toISOString()
      });
    } finally {
      this.isLoading = false;
      this.scrollToBottom();
    }
  }

  private async salvarMensagemNoBanco(role: 'user' | 'assistant', content: string) {
    if (!this.userId) return;

    try {
      const { error } = await this.supabase
        .from('ia_mensagens')
        .insert([{
          user_id: this.userId,
          role: role,
          content: content,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('❌ Erro ao salvar ia_mensagens no Supabase:', error.message);
      }
    } catch (err) {
      console.error('Erro ao conectar ao Supabase:', err);
    }
  }

  // ====================================================================
  // 3. EMISSÃO DE RELATÓRIO COM DADOS VERÍDICOS DO BANCO DE DADOS
  // ====================================================================
  async solicitarRelatorioDesempenho() {
    if (this.planoUsuario !== 'premium') {
      const alert = await this.alertCtrl.create({
        header: 'Funcionalidade Premium ⭐',
        subHeader: 'Relatório Semanal de Desempenho com IA',
        message: 'A emissão de diagnósticos semanais e planos de melhorias pessoais baseados nos seus dados reais é exclusiva para membros do Plano Premium.\n\nFaça o upgrade no seu perfil e acompanhe sua evolução completa!',
        buttons: [
          { text: 'Mais tarde', role: 'cancel' },
          {
            text: 'Conhecer Planos',
            handler: () => {
              this.navCtrl.navigateForward('/tabs/tab5');
            }
          }
        ]
      });
      await alert.present();
      return;
    }

    await this.gerarRelatorioComIA();
  }

  private async gerarRelatorioComIA() {
    this.gerandoRelatorio = true;

    try {
      // 1. Consulta dados consolidados da VIEW public.vw_desempenho_geral
      let desempenhoView: any = null;
      try {
        const { data: vwData, error: vwError } = await this.supabase
          .from('vw_desempenho_geral')
          .select('*')
          .eq('user_id', this.userId)
          .maybeSingle();

        if (!vwError && vwData) {
          desempenhoView = vwData;
        }
      } catch (e) {
        console.warn('View vw_desempenho_geral não encontrada ou inacessível, usando fallback:', e);
      }

      // 2. Consulta histórico detalhado de quizzes e matérias
      const { data: historicoQuizzes } = await this.supabase
        .from('historico_quizzes')
        .select(`
          acertou,
          created_at,
          materias ( nome )
        `)
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(30);

      // 3. Consulta últimas dúvidas enviadas para a IA na tabela ia_mensagens
      const { data: ultimasPerguntas } = await this.supabase
        .from('ia_mensagens')
        .select('content, created_at')
        .eq('user_id', this.userId)
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(5);

      // 4. Fallback de perfil caso a view não esteja disponível
      let nivel = desempenhoView?.nivel || 1;
      let xp = desempenhoView?.xp || 0;
      let ofensiva = desempenhoView?.ofensiva_dias || 0;
      let totalMinutosFoco = Number(desempenhoView?.total_minutos_foco || 0);
      let blocosConcluidos = Number(desempenhoView?.blocos_concluidos || 0);
      let taxaAcertoGeral = Number(desempenhoView?.taxa_acerto_quizzes || 0);

      if (!desempenhoView) {
        const { data: perfil } = await this.supabase
          .from('profiles')
          .select('nivel, xp, ofensiva_dias, tempo_foco_maximo_dia')
          .eq('id', this.userId)
          .maybeSingle();

        if (perfil) {
          nivel = perfil.nivel ?? 1;
          xp = perfil.xp ?? 0;
          ofensiva = perfil.ofensiva_dias ?? 0;
        }

        const quizzes = historicoQuizzes || [];
        if (quizzes.length > 0) {
          const acertos = quizzes.filter(q => q.acertou).length;
          taxaAcertoGeral = Math.round((acertos / quizzes.length) * 100);
        }
      }

      // 5. Agrega estatísticas verídicas de quizzes por matéria
      const materiasMap = new Map<string, { total: number; acertos: number }>();
      (historicoQuizzes || []).forEach((q: any) => {
        const nomeMateria = q.materias?.nome || 'Geral';
        const item = materiasMap.get(nomeMateria) || { total: 0, acertos: 0 };
        item.total++;
        if (q.acertou) item.acertos++;
        materiasMap.set(nomeMateria, item);
      });

      let estatisticasMateriasTxt = '';
      materiasMap.forEach((val, mat) => {
        const pct = Math.round((val.acertos / val.total) * 100);
        estatisticasMateriasTxt += `  - ${mat}: ${pct}% de acerto (${val.acertos}/${val.total} questões)\n`;
      });

      if (!estatisticasMateriasTxt) {
        estatisticasMateriasTxt = '  - Nenhum quiz resolvido nesta semana.\n';
      }

      const topicosDuvidasTxt = (ultimasPerguntas || [])
        .map((p: any) => `  - "${p.content}"`)
        .join('\n') || '  - Nenhuma consulta recente registrada.';

      // Data da semana (segunda-feira atual)
      const dataHoje = new Date();
      const diaDaSemana = dataHoje.getDay();
      const diffParaSegunda = dataHoje.getDate() - diaDaSemana + (diaDaSemana === 0 ? -6 : 1);
      const segundaFeira = new Date(dataHoje.setDate(diffParaSegunda));
      const semanaInicioStr = segundaFeira.toISOString().split('T')[0];

      // 6. Monta o Prompt Analítico enriquecido com DADOS REAIS E VERÍDICOS DO BANCO
      const promptRelatorio = `Gere um Relatório Semanal de Desempenho e Diagnóstico Alquímico com base ESTRITAMENTE nos dados reais deste aluno:

MÉTRICAS VERÍDICAS DO ALUNO (BANCO DE DADOS):
- Nível Atual: ${nivel} | XP Acumulado: ${xp} XP
- Ofensiva Consecutiva: ${ofensiva} dia(s)
- Total de Foco em Sessões Pomodoro: ${Math.floor(totalMinutosFoco / 60)}h ${totalMinutosFoco % 60}min
- Blocos de Estudo Concluídos: ${blocosConcluidos}
- Taxa Média de Acerto em Quizzes: ${taxaAcertoGeral}%
- Desempenho por Matéria no Banco:
${estatisticasMateriasTxt}
- Dúvidas Recentes feitas ao Espírito Alquímico:
${topicosDuvidasTxt}
- Técnica Preferida: ${this.preferencias.tecnica_preferida} | Meta: ${this.preferencias.meta_horas_dia}h/dia

ESTRUTURA DO RELATÓRIO:
1. 📜 DIAGNÓSTICO TRANSMUTACIONAL: Avalie a constância e dedicação com base nas métricas reais acima.
2. 📊 BARRAS VISUAIS MOBILE:
   - Taxa de Retenção: [${this.gerarBarraVisual(taxaAcertoGeral)}] ${taxaAcertoGeral}%
   - Consistência de Foco: [${this.gerarBarraVisual(Math.min(100, (totalMinutosFoco / 180) * 100))}] ${Math.floor(totalMinutosFoco / 60)}h focadas
3. ⚡ PONTOS FORTES: Destaque as matérias com maior acerto e constância.
4. 🔍 PONTOS DE ATENÇÃO: Identifique matérias com menor rendimento ou necessidade de aumentar o tempo de foco.
5. 🧪 PLANO PRÁTICO PARA OS PRÓXIMOS 7 DIAS: 3 passos objetivos usando a técnica ${this.preferencias.tecnica_preferida}.

Seja conciso, inspirador e mobile-friendly.`;

      const payload = [
        { role: 'system', content: this.obterSystemPrompt() },
        { role: 'user', content: promptRelatorio }
      ];

      const conteudoRelatorio = await this.chamarIAComFallback(payload, 1500);

      this.relatorioConteudo = conteudoRelatorio;
      this.relatorioSemana = semanaInicioStr;

      // Salva na tabela relatorios_semanais
      await this.salvarRelatorioSemanalNoBanco(semanaInicioStr, conteudoRelatorio);

      this.modalRelatorioAberto = true;

    } catch (err: any) {
      console.error('Erro ao emitir relatório verídico com IA:', err);
      const toast = await this.toastCtrl.create({
        message: 'Erro ao gerar relatório: ' + (err.message || 'Tente novamente.'),
        duration: 3500,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.gerandoRelatorio = false;
    }
  }

  private gerarBarraVisual(porcentagem: number): string {
    const totalBlocos = 10;
    const blocosCheios = Math.max(0, Math.min(10, Math.round((porcentagem / 100) * totalBlocos)));
    const blocosVazios = totalBlocos - blocosCheios;
    return '█'.repeat(blocosCheios) + '░'.repeat(blocosVazios);
  }

  private async salvarRelatorioSemanalNoBanco(semanaInicio: string, conteudo: string) {
    if (!this.userId) return;

    try {
      const { error } = await this.supabase
        .from('relatorios_semanais')
        .upsert(
          {
            user_id: this.userId,
            semana_inicio: semanaInicio,
            conteudo: conteudo,
            created_at: new Date().toISOString()
          },
          { onConflict: 'user_id,semana_inicio' }
        );

      if (error) {
        console.error('❌ Erro ao salvar relatorios_semanais:', error.message);
      } else {
        console.log('✅ Relatório semanal salvo com sucesso no Supabase!');
      }
    } catch (err) {
      console.error('Erro ao conectar ao Supabase para relatórios:', err);
    }
  }

  fecharModalRelatorio() {
    this.modalRelatorioAberto = false;
  }

  async copiarRelatorio() {
    try {
      await navigator.clipboard.writeText(this.relatorioConteudo);
      const toast = await this.toastCtrl.create({
        message: 'Relatório copiado para a área de transferência!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    } catch {
      // Fallback
    }
  }

  // ====================================================================
  // 4. PREFERÊNCIAS DE ESTUDO (ia_preferencias)
  // ====================================================================
  abrirModalPreferencias() {
    this.modalPreferenciasAberto = true;
  }

  fecharModalPreferencias() {
    this.modalPreferenciasAberto = false;
  }

  alternarMateriaFoco(materia: string) {
    const idx = this.preferencias.materias_foco.indexOf(materia);
    if (idx > -1) {
      this.preferencias.materias_foco.splice(idx, 1);
    } else {
      this.preferencias.materias_foco.push(materia);
    }
  }

  async salvarPreferencias() {
    if (!this.userId) {
      this.fecharModalPreferencias();
      return;
    }

    try {
      const payload = {
        user_id: this.userId,
        materias_foco: this.preferencias.materias_foco,
        horario_preferido: this.preferencias.horario_preferido,
        meta_horas_dia: this.preferencias.meta_horas_dia,
        tecnica_preferida: this.preferencias.tecnica_preferida,
        observacoes: this.preferencias.observacoes,
        updated_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('ia_preferencias')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      const toast = await this.toastCtrl.create({
        message: 'Preferências salvas com sucesso! 🧪',
        duration: 2500,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
      this.fecharModalPreferencias();
    } catch (err: any) {
      console.error('Erro ao salvar preferências:', err);
      const toast = await this.toastCtrl.create({
        message: 'Erro ao salvar preferências no banco.',
        duration: 2500,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    }
  }

  // ====================================================================
  // 5. LIMPEZA DE CONVERSA
  // ====================================================================
  async confirmarLimparHistorico() {
    const alert = await this.alertCtrl.create({
      header: 'Reiniciar Conversa',
      message: 'Deseja apagar o histórico de mensagens do Espírito Alquímico? Suas preferências e relatórios continuarão salvos.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Apagar',
          role: 'destructive',
          handler: async () => {
            await this.limparHistorico();
          }
        }
      ]
    });
    await alert.present();
  }

  private async limparHistorico() {
    if (this.userId) {
      try {
        await this.supabase
          .from('ia_mensagens')
          .delete()
          .eq('user_id', this.userId);
      } catch (err) {
        console.error('Erro ao deletar histórico:', err);
      }
    }
    this.messages = [];
    this.aplicarMensagemInicialPadrao();
  }

  // ====================================================================
  // 6. UTILITÁRIOS (RODAGEM, ANEXOS, CÓDIGO, VOZ)
  // ====================================================================
  scrollToBottom() {
    setTimeout(() => {
      this.content?.scrollToBottom(300);
    }, 100);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.userInput += ` [Imagem anexada: ${file.name}] `;
    }
  }

  insertCodeSnippet() {
    this.userInput += '\n```\n// Insira seu código aqui\n```\n';
  }

  toggleVoiceRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Reconhecimento de voz não suportado neste navegador.');
      return;
    }

    if (this.isRecording) {
      this.recognition?.stop();
      this.isRecording = false;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'pt-BR';
    this.recognition.continuous = false;

    this.isRecording = true;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.userInput += (this.userInput ? ' ' : '') + transcript;
      this.isRecording = false;
    };

    this.recognition.onerror = () => {
      this.isRecording = false;
    };

    this.recognition.onend = () => {
      this.isRecording = false;
    };

    this.recognition.start();
  }
}