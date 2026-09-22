import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RelaxamentoPageRoutingModule } from './relaxamento-routing.module';

import { RelaxamentoPage } from './relaxamento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RelaxamentoPageRoutingModule
  ],
  declarations: [RelaxamentoPage]
})
export class RelaxamentoPageModule {}
