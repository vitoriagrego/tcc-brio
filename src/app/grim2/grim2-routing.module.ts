import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Grim2Page } from './grim2.page';

const routes: Routes = [
  {
    path: '',
    component: Grim2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Grim2PageRoutingModule {}
