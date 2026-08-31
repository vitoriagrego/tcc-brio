import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { GuildasPageRoutingModule } from './guildas-routing.module';
import { GuildaPage } from './guildas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GuildasPageRoutingModule
  ],
  declarations: [GuildaPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GuildasPageModule {}