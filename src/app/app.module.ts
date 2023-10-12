import { LOCALE_ID, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import '@angular/common/locales/global/de';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FdmRegistrationComponent } from './fdm-registration/fdm-registration.component';

import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { initializeAuth, provideAuth } from '@angular/fire/auth';

import { environment } from './../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FdmRegistrationComponent,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => initializeAuth(getApp(), {
      persistence: undefined,
      popupRedirectResolver: undefined
    })
    ),
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'de' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
