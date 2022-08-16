import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // a plugin!
import { FullCalendarModule } from '@fullcalendar/angular';
import { PopupComponent } from './popup.component';
import { ProgressSpinnerComponent } from './progress-spinner/progress-spinner.component';
import { MessageComponent } from './message/message.component';

FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);

@NgModule({
  declarations: [PopupComponent, ProgressSpinnerComponent, MessageComponent],
  imports: [BrowserModule, MatProgressSpinnerModule, FullCalendarModule],
})
export class PopupModule {}
