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

  // Armazena as respostas das perguntas do formulário
  respostas: { [key: number]: any } = {};

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {}

  selecionarOpcao(perguntaId: number, valor: any) {
    this.respostas[perguntaId] = valor;
  }

  // Envio realizado diretamente pelo cliente sem precisar alterar o supabase.ts
  async enviarQuestionario() {
    const loading = await this.loadingController.create({
      message: 'Salvando suas preferências...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      if (typeof (this.supabaseService as any).salvarQuestionario === 'function') {
        await (this.supabaseService as any).salvarQuestionario({
          respostas_completas: this.respostas
        });
      } else {
        const client = (this.supabaseService as any).client || (this.supabaseService as any).supabase;

        let userId: string | null = null;
        if (typeof (this.supabaseService as any).getUsuarioAtual === 'function') {
          const u = await (this.supabaseService as any).getUsuarioAtual();
          userId = u?.id || null;
        }

        if (!userId && client) {
          const { data: sessData } = await client.auth.getSession();
          userId = sessData?.session?.user?.id || null;

          if (!userId) {
            const { data: userData } = await client.auth.getUser();
            userId = userData?.user?.id || null;
          }
        }

        if (!userId) {
          throw new Error('Usuário não autenticado. Por favor, faça login para salvar.');
        }

        const { error } = await client
          .from('user_questionnaire')
          .upsert({
            user_id: userId,
            respostas_completas: this.respostas,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (error) throw error;
      }

      await loading.dismiss();
      
      const toast = await this.toastController.create({
        message: 'Questionário salvo com sucesso!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();

      this.router.navigate(['/tabs', 'tab1']);

    } catch (error: any) {
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: 'Erro ao salvar questionário: ' + (error.message || error),
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    }
  }

  async finalizarQuestionario() {
    await this.enviarQuestionario();
  }
}