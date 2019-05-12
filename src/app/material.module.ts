import { NgModule } from '@angular/core';

import {
  MatButtonModule,
  MatCommonModule,
  MatIconModule,
  MatMenuModule,
  MatSliderModule,
  MatTooltipModule
} from '@angular/material';

import {
  FlexLayoutModule
} from '@angular/flex-layout';

@NgModule({
  exports: [
    MatButtonModule,
    MatCommonModule,
    MatIconModule,
    MatMenuModule,
    MatSliderModule,
    MatTooltipModule,
    FlexLayoutModule
  ]
})
export class MaterialModule { }
