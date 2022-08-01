import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CalendarOptions, DayCellMountArg, EventInput, FullCalendarComponent } from '@fullcalendar/angular';
import axios from 'axios';
import { calendar_v3 } from '@googleapis/calendar';
import { Country } from 'src/model/Country';
type Schema$Events = calendar_v3.Schema$Events;

@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupComponent implements OnInit {
  public calendarOptions: CalendarOptions = {};
  private eventMap: Map<string, EventInput[]> = new Map();

  constructor() {
    FullCalendarComponent
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      dayCellDidMount: (arg: DayCellMountArg)=>{
        arg.el.addEventListener('mouseover', (event)=>{

          const date = (arg.date.getDate()).toString().padStart(2, '0');
          const month = (arg.date.getMonth()+1).toString().padStart(2, '0');
          const key = `${arg.date.getFullYear()}-${month}-${date}`;
          const events: EventInput[] | undefined = this.eventMap.get(key);
          if(events !== undefined && arg.el.getElementsByClassName('day_detail_tooltip').length === 0){
  
            let title = '';
            for(let event of events){
              title += event.title + "\n";
            }

            const element: HTMLSpanElement = document.createElement('span');
            element.classList.add('day_detail_tooltip');
            element.innerText = title
            arg.el.appendChild(element);
          }
        });
      }
    };
  }

  public async ngOnInit(): Promise<void> {
    this.calendarOptions.events = await this.getHolidayEvents();
  }

  public async getHolidayEvents(): Promise<EventInput[]> {
    const eventList: EventInput[] = [];

    const watchList: Country[] = (await chrome.storage.sync.get('watchList'))['watchList'];

    for (const country of watchList) {
      const url: string = `https://www.googleapis.com/calendar/v3/calendars/en.${country.code}%23holiday%40group.v.calendar.google.com/events?key=AIzaSyAxHZk4hcnmO1Bl9hJ5D_LxTYcRLrJQ7Lg`;
      console.log(url);
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
            const dateKey = startDate.toISOString().slice(0, 10);
            const event: EventInput = {
              title: `${country.label}: ${item.summary}`,
              date: dateKey,
            };

            console.log(startDate, event.title, item.start);
            const events: EventInput[] | undefined = this.eventMap.get(dateKey);
            if(events !== undefined){
              events.push(event);
            }else{
              this.eventMap.set(dateKey, [event]);
            }

            eventList.push(event);
            startDate.setDate(startDate.getDate() + 1);
          }
        }
      }
    }
    return eventList;
  }
}
