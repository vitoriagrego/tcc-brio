import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BiologiaPage } from './biologia.page';

const routes: Routes = [
  {
    path: '',
    component: BiologiaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BiologiaPageRoutingModule {}
