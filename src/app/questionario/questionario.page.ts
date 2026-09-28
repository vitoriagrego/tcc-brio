import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase';

@Component({
  selector: 'app-questionario',
  templateUrl: './questionario.page.html',
  styleUrls: ['./questionario.page.scss'],
  standalone: false,
})
export class QuestionarioPage implements OnInit {

  // Objeto para armazenar as respostas das 12 perguntas do seu HTML
  respostas: { [key: number]: any } = {};

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {}

  // Registra a resposta selecionada em cada ion-radio-group do HTML
  selecionarOpcao(perguntaId: number, valor: any) {
    this.respostas[perguntaId] = valor;
  }

  // Função acionada pelo botão (click)="enviarQuestionario()" do HTML
  async enviarQuestionario() {
    const loading = await this.loadingController.create({
      message: 'Salvando suas preferências...'
    });
    await loading.present();

    try {
      // Salva todas as respostas no formato JSONB na tabela 'user_questionnaire'
      await this.supabaseService.salvarQuestionario({
        respostas_completas: this.respostas
      });

      await loading.dismiss();
      
      const toast = await this.toastController.create({
        message: 'Questionário salvo com sucesso!',
        duration: 2000,
        position: 'bottom'
      });
      toast.present();

      // Redireciona para o aplicativo principal
      this.router.navigate(['/tabs', 'tab1']);

    } catch (error: any) {
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: 'Erro ao salvar questionário: ' + (error.message || error),
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
    }
  }

  // Mantido caso também queira usar em outro lugar
  async finalizarQuestionario() {
    await this.enviarQuestionario();
  }
}