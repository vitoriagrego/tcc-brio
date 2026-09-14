import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BiologiaPageRoutingModule } from './biologia-routing.module';

import { BiologiaPage } from './biologia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BiologiaPageRoutingModule
  ],
  declarations: [BiologiaPage]
})
export class BiologiaPageModule {}
