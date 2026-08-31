import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-backup-sincronizacao',
  templateUrl: './backup-sincronizacao.page.html',
  styleUrls: ['./backup-sincronizacao.page.scss'],
  standalone: false
})
export class BackupSincronizacaoPage implements OnInit {

  sincronizacaoAutomatica: boolean = true;
  apenasWifi: boolean = true;
  ultimaSincronizacao: string = 'Hoje, às 10:30';
  carregando: boolean = false;

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.carregarPreferencias();
  }

  carregarPreferencias() {
    const auto = localStorage.getItem('app_backup_auto');
    const wifi = localStorage.getItem('app_backup_wifi');
    const ultima = localStorage.getItem('app_backup_ultima');

    if (auto !== null) this.sincronizacaoAutomatica = auto === 'true';
    if (wifi !== null) this.apenasWifi = wifi === 'true';
    if (ultima) this.ultimaSincronizacao = ultima;
  }

  salvarPreferencias() {
    localStorage.setItem('app_backup_auto', String(this.sincronizacaoAutomatica));
    localStorage.setItem('app_backup_wifi', String(this.apenasWifi));
  }

  async fazerBackupAgora() {
    this.carregando = true;

    // Simula o tempo de salvamento do backup (2 segundos)
    setTimeout(async () => {
      this.carregando = false;
      const agora = new Date();
      this.ultimaSincronizacao = `Hoje, às ${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
      
      localStorage.setItem('app_backup_ultima', this.ultimaSincronizacao);

      const toast = await this.toastController.create({
        message: 'Backup realizado com sucesso!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    }, 2000);
  }

  goBack() {
    this.navCtrl.navigateBack('/config');
  }

}