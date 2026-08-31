import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Grim1PageRoutingModule } from './grim1-routing.module';

import { Grim1Page } from './grim1.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Grim1PageRoutingModule
  ],
  declarations: [Grim1Page]
})
export class Grim1PageModule {}
