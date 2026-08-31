import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BackupSincronizacaoPage } from './backup-sincronizacao.page';

const routes: Routes = [
  {
    path: '',
    component: BackupSincronizacaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BackupSincronizacaoPageRoutingModule {}
