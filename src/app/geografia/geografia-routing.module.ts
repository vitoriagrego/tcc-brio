import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GeografiaPage } from './geografia.page';

const routes: Routes = [
  {
    path: '',
    component: GeografiaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeografiaPageRoutingModule {}
