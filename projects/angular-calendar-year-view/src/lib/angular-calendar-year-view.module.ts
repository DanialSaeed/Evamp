import { NgModule, ModuleWithProviders } from '@angular/core';
import { AngularCalendarYearViewComponent } from './angular-calendar-year-view.component';
import { PopoverModule } from 'ngx-bootstrap/popover'
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  declarations: [
    AngularCalendarYearViewComponent
  ],
  imports: [
    CommonModule,
    PopoverModule,
    FlexLayoutModule
  ],
  exports: [
    AngularCalendarYearViewComponent
  ]
})
export class AngularCalendarYearViewModule { 
  public static forRoot(): ModuleWithProviders<AngularCalendarYearViewModule>  {
    return {
      ngModule: AngularCalendarYearViewModule,
      providers: [
        PopoverModule.forRoot().providers
      ]
    }
  }
}
