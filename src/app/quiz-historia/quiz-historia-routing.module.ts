import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { QuizHistoriaPage } from './quiz-historia.page';

const routes: Routes = [
  {
    path: '',
    component: QuizHistoriaPage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class QuizHistoriaPageRoutingModule {}