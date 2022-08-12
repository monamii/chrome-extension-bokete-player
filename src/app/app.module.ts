import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // a plugin!
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PopupComponent } from './popup/popup.component';
import { OptionsComponent } from './options/options.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);
@NgModule({
  declarations: [AppComponent, PopupComponent, OptionsComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FullCalendarModule,
    MatProgressSpinnerModule,
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
