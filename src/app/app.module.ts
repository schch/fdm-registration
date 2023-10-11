import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import '@angular/common/locales/global/de';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FdmRegistrationComponent } from './fdm-registration/fdm-registration.component';

import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { browserSessionPersistence, initializeAuth, provideAuth } from '@angular/fire/auth';
import { firebaseConfig } from './FirebaseConfig';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FdmRegistrationComponent,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
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
