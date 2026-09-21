import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GeografiaPageRoutingModule } from './geografia-routing.module';

import { GeografiaPage } from './geografia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GeografiaPageRoutingModule
  ],
  declarations: [GeografiaPage]
})
export class GeografiaPageModule {}
