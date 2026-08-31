import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BackupSincronizacaoPageRoutingModule } from './backup-sincronizacao-routing.module';

import { BackupSincronizacaoPage } from './backup-sincronizacao.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BackupSincronizacaoPageRoutingModule
  ],
  declarations: [BackupSincronizacaoPage]
})
export class BackupSincronizacaoPageModule {}
