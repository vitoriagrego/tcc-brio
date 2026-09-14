import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Grim2PageRoutingModule } from './grim2-routing.module';

import { Grim2Page } from './grim2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Grim2PageRoutingModule
  ],
  declarations: [Grim2Page]
})
export class Grim2PageModule {}
