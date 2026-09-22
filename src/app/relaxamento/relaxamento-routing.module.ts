import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RelaxamentoPage } from './relaxamento.page';

const routes: Routes = [
  {
    path: '',
    component: RelaxamentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RelaxamentoPageRoutingModule {}
