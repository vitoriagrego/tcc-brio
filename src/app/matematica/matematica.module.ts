import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MatematicaPageRoutingModule } from './matematica-routing.module';

import { MatematicaPage } from './matematica.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatematicaPageRoutingModule
  ],
  declarations: [MatematicaPage]
})
export class MatematicaPageModule {}
