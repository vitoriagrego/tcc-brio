import { Component, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
// 1. IMPORTAR O ENVIRONMENT AQUI
import { environment } from 'src/environments/environment';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-ia',
  templateUrl: 'ia.page.html',
  styleUrls: ['ia.page.scss'],
  standalone: false,
})
export class IaPage {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  userInput: string = '';
  isLoading: boolean = false;

  messages: Message[] = [
    { 
      sender: 'ai', 
      text: 'Você parece desanimado hoje.\n\nGostaria de um conselho animador para começar?\nOu prefere uma sugestão para alterar sua rotina?' 
    }
  ];
// 2. ALTERADO: Agora a chave é lida diretamente do arquivo de environment
  private apiKey: string = environment.openRouterApiKey;
  private model: string = 'openai/gpt-3.5-turbo';

  private systemPrompt: string = `Você é o "Espírito Alquímico", um guia e mentor virtual especializado em transmutar hábitos de estudo em alto rendimento. Suas respostas devem ser concisas, diretas e formatadas para leitura rápida em telas de celulares.

SUAS FUNÇÕES PRINCIPAIS:
1. MENTOR DE ESTUDOS: Ajude com rotinas, cronogramas, técnicas de aprendizagem (Feynman, Pomodoro, Repetição Espaçada) e foco.
2. GUIA DE APRENDIZADO (NÃO DÊ RESPOSTAS PRONTAS): Nunca entregue resumos prontos ou explicações completas sobre conteúdos acadêmicos. Se o usuário perguntar sobre um tema (ex: "como foi a colonização do Brasil" ou "física quântica"), forneça um roteiro de estudos, tópicos-chave para ele pesquisar, perguntas norteadoras e fontes confiáveis recomendadas. Seu papel é instigar a curiosidade e ensinar *como* estudar o assunto.
3. APOIO MOTIVACIONAL: Caso o usuário demonstre desânimo, preguiça ou cansaço, forneça conselhos empáticos, frases animadoras e estratégias de micro-passos para fazê-lo começar a estudar sem pressão.
4. ANALISTA DE DESEMPENHO: Sempre que o usuário enviar notas, horas estudadas ou simulados, analise o progresso e forneça um feedback básico em texto curto.
5. GRÁFICOS VISUAIS SIMPLES: Quando analisar desempenho ou evolução, monte pequenos gráficos visuais legíveis no celular usando barras de texto/emojis (exemplo: [████████░░] 80%).

REGRAS DE ATUAÇÃO:
1. FOCO EXCLUSIVO: Responda APENAS sobre organização de rotina, orientação de estudos, técnicas de aprendizado, motivação acadêmica e análise de desempenho.
2. ABORDAGEM SOCRÁTICA: Estimule a autonomia. Termine as orientações fazendo uma pergunta para o usuário definir seu próximo passo de estudo.
3. RECUSA EDUCADA: Se o usuário perguntar sobre algo fora desse escopo (assuntos aleatórios ou não acadêmicos), responda: "Como Espírito Alquímico, minha missão é focar exclusivamente na sua rotina de estudos e desempenho. Como posso te ajudar hoje?"
4. FORMATO MOBILE: Seja sucinto. Use tópicos curtos, negritos e listas para facilitar a leitura rápida no app.`;

  constructor() {}

  sendMessageOnEnter(event: any) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const prompt = this.userInput;
    this.messages.push({ sender: 'user', text: prompt });
    this.userInput = '';
    this.isLoading = true;
    this.scrollToBottom();

    const apiMessages = this.messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    const payloadMessages = [
      { role: 'system', content: this.systemPrompt },
      ...apiMessages
    ];

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'http://localhost:8100',
          'X-Title': 'Ionic Chat App',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: payloadMessages
        })
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'Erro ao processar resposta.';
      
      this.messages.push({ sender: 'ai', text: reply });
    } catch (error) {
      this.messages.push({ sender: 'ai', text: 'Erro de conexão com a API.' });
    } finally {
      this.isLoading = false;
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content?.scrollToBottom(300);
    }, 100);
  }
  // Adicione estas propriedades na classe
isRecording: boolean = false;
private recognition: any;

// 1. AÇÃO DO BOTÃO DE IMAGEM
onImageSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.userInput += ` [Imagem anexada: ${file.name}] `;
    // Aqui você pode adicionar lógica para enviar a imagem caso use um modelo multimodal
  }
}

// 2. AÇÃO DO BOTÃO DE CÓDIGO (Insere marcação markdown de código no input)
insertCodeSnippet() {
  this.userInput += '\n```\n// Insira seu código aqui\n```\n';
}

// 3. AÇÃO DO BOTÃO DE MICROFONE (Reconhecimento de Voz usando Web Speech API nativa)
toggleVoiceRecognition() {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert('Reconhecimento de voz não suportado neste navegador.');
    return;
  }

  if (this.isRecording) {
    this.recognition.stop();
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