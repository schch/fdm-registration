import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FdmRegistrationComponent } from './fdm-registration/fdm-registration.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FdmRegistrationComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }