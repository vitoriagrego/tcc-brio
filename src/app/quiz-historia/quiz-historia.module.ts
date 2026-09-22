import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuizHistoriaPageRoutingModule } from './quiz-historia-routing.module';
import { QuizHistoriaPage } from './quiz-historia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuizHistoriaPageRoutingModule
  ],
  declarations: [
    QuizHistoriaPage
  ]
})
export class QuizHistoriaPageModule {}