import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: false
})
export class EditarPerfilPage implements OnInit {

  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  nickname: string = 'Nickname';
  avatarAtual: string = 'assets/perfil.png';
  avatarSelecionado: string = 'assets/perfil.png';
  salvando: boolean = false;
  planoUsuario: 'gratis' | 'premium' = 'gratis';

  // Lista com todos os 7 avatares disponíveis
  opcoesAvatares: string[] = [
    'assets/perfil.png',
    'assets/perfil2.png',
    'assets/perfil3.png',
    'assets/perfil4.png',
    'assets/perfil5.png',
    'assets/perfil6.png',
    'assets/perfil7.png'
  ];

  // ========================================================
  // REQUISITO: BLOQUEAR 3 AVATARES NO PLANO GRATUITO
  // ========================================================
  readonly avataresPremium: string[] = [
    'assets/perfil5.png',
    'assets/perfil6.png',
    'assets/perfil7.png'
  ];

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.carregarDadosAtuais();
  }

  ionViewWillEnter() {
    this.carregarDadosAtuais();
  }

  async carregarDadosAtuais() {
    const nomeSalvo = localStorage.getItem('app_user_nickname');
    if (nomeSalvo) this.nickname = nomeSalvo;

    const avatarSalvo = localStorage.getItem('app_user_avatar');
    if (avatarSalvo) {
      this.avatarAtual = avatarSalvo;
      this.avatarSelecionado = avatarSalvo;
    }

    const planoSalvo = localStorage.getItem('app_user_plano');
    if (planoSalvo === 'premium') {
      this.planoUsuario = 'premium';
    }

    try {
      const { data: sess } = await this.supabase.auth.getSession();
      const userId = sess.session?.user.id;
      if (!userId) return;

      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('nickname, avatar_url, plano')
        .eq('id', userId)
        .maybeSingle();

      if (error || !profile) return;

      if (profile.nickname) this.nickname = profile.nickname;
      if (profile.avatar_url) {
        this.avatarAtual = profile.avatar_url;
        this.avatarSelecionado = profile.avatar_url;
      }

      this.planoUsuario = profile.plano === 'premium' ? 'premium' : 'gratis';
      localStorage.setItem('app_user_plano', this.planoUsuario);

    } catch (e) {
      console.error('Erro ao carregar perfil do banco:', e);
    }
  }

  // Verifica se um avatar específico está bloqueado para o usuário
  isAvatarBloqueado(path: string): boolean {
    return this.planoUsuario !== 'premium' && this.avataresPremium.includes(path);
  }

  async selecionarAvatar(path: string) {
    if (this.isAvatarBloqueado(path)) {
      const alert = await this.alertCtrl.create({
        header: 'Avatar Exclusivo Premium ⭐',
        subHeader: 'Desbloqueie todos os avatares!',
        message: 'Este avatar lendário é exclusivo para membros do Plano Premium. Faça o upgrade no seu perfil para personalizar seu alquimista livremente!',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Ver Planos',
            handler: () => {
              this.navCtrl.navigateForward('/tabs/tab5');
            }
          }
        ]
      });
      await alert.present();
      return;
    }

    this.avatarSelecionado = path;
  }

  async salvarPerfil() {
    if (this.salvando) return;

    const nicknameTratado = (this.nickname || '').trim();

    if (!nicknameTratado) {
      const toastErro = await this.toastCtrl.create({
        message: 'O nome de usuário não pode ficar em branco.',
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      await toastErro.present();
      return;
    }

    // Se o usuário tentar salvar um avatar que está bloqueado para ele
    if (this.isAvatarBloqueado(this.avatarSelecionado)) {
      const toastBloqueio = await this.toastCtrl.create({
        message: 'Selecione um avatar disponível no seu plano gratuito ou assine o Premium.',
        duration: 2500,
        color: 'warning',
        position: 'bottom'
      });
      await toastBloqueio.present();
      return;
    }

    this.salvando = true;

    try {
      const { data: sess } = await this.supabase.auth.getSession();
      const userId = sess.session?.user.id;

      if (!userId) throw new Error('Usuário não autenticado.');

      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          nickname: nicknameTratado,
          avatar_url: this.avatarSelecionado,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('nickname, avatar_url');

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Não foi possível salvar as alterações no banco de dados.');

      this.nickname = data[0].nickname;
      this.avatarAtual = data[0].avatar_url;

      localStorage.setItem('app_user_nickname', this.nickname);
      localStorage.setItem('app_user_avatar', this.avatarAtual);

      // Dispara o evento avisando a Tab5Page que o perfil foi alterado
      window.dispatchEvent(new CustomEvent('perfil-atualizado', {
        detail: { nickname: this.nickname, avatar: this.avatarAtual, plano: this.planoUsuario }
      }));

      const toast = await this.toastCtrl.create({
        message: 'Perfil atualizado com sucesso!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();

      this.goBack();
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err);
      const toastErro = await this.toastCtrl.create({
        message: err?.message || 'Erro ao salvar alterações no banco de dados.',
        duration: 2500,
        color: 'danger',
        position: 'bottom'
      });
      await toastErro.present();
    } finally {
      this.salvando = false;
    }
  }

  goBack() {
    this.navCtrl.navigateBack('/tabs/tab5');
  }
}
