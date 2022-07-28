import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/angular';
import { DateClickArg } from '@fullcalendar/interaction';
import axios from 'axios';
import { calendar_v3 } from '@googleapis/calendar';
import { Country } from 'src/model/Country';
type Schema$Events = calendar_v3.Schema$Events;

@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {
  public calendarOptions: CalendarOptions = {};

  public async ngOnInit(): Promise<void> {
    const events = await this.getHolidayEvents();
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      dateClick: this.handleDateClick.bind(this),
      events: events,
    };
  }

  public async getHolidayEvents(): Promise<EventInput[]> {
    const eventList: EventInput[] = [];

    console.log('sync', (await chrome.storage.sync.get('watchList')));
    const watchList: Country[] = (await chrome.storage.sync.get('watchList'))['watchList'];
    console.log('popup watchList', watchList);

    for (const country of watchList) {
      console.log(country);
      const url: string = `https://www.googleapis.com/calendar/v3/calendars/en.${country.code}%23holiday%40group.v.calendar.google.com/events?key=AIzaSyAxHZk4hcnmO1Bl9hJ5D_LxTYcRLrJQ7Lg`;
      const { data } = await axios.get<Schema$Events>(url);
      if (data.items === undefined) {
        return eventList;
      }

      for (const item of data.items) {
        if (
          item.description === 'Public holiday' &&
          item.summary !== null &&
          item.summary !== undefined &&
          item.start?.date !== null &&
          item.start?.date !== undefined &&
          item.end?.date !== null &&
          item.end?.date !== undefined
        ) {
          const startDate = new Date(item.start?.date);
          const endDate = new Date(item.end?.date);

          while (startDate.getTime() < endDate.getTime()) {
            const event: EventInput = {
              // title: item.summary,
              title: country.label,
              date: startDate.toISOString().slice(0, 10),
            };
            eventList.push(event);
            startDate.setDate(startDate.getDate() + 1);
          }
        }
      }
    }
    return eventList;
  }

  public handleDateClick(arg: DateClickArg) {
    alert('date click!' + arg.dateStr);
  }
}
