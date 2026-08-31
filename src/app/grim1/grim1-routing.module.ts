import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Grim1Page } from './grim1.page';

const routes: Routes = [
  {
    path: '',
    component: Grim1Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Grim1PageRoutingModule {}
