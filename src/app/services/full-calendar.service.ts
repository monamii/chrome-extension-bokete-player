import { Injectable } from '@angular/core';
import {
  CalendarOptions,
  DayCellMountArg,
  EventInput,
  EventMountArg,
} from '@fullcalendar/angular';
import { CalendarApiData } from '../model/CalendarApiData';
import { Country } from '../model/Country';
import { ChromeStorage } from '../model/enum/ChromeStorage';
import { Schema$Event } from '../model/type/FullCalendarSupplementalType';

@Injectable({
  providedIn: 'root',
})
export class FullCalendarService {
  private eventMap: Map<string, EventInput[]> = new Map();
  private readonly COUNTRY_FLAG_PATH: string = 'assets\\images\\flags\\';
  constructor() {}

  public getCalendarOptions(): CalendarOptions {
    return {
      initialView: 'dayGridMonth',
      height: '100%',

      customButtons: {
        optionsButton: {
          text: 'Options',
          click: function () {
            chrome.runtime.openOptionsPage();
          },
        },
      },
      footerToolbar: {
        left: 'optionsButton',
      },

      dayCellDidMount: (arg: DayCellMountArg) => {
        this.addTooltipToDay(arg);
      },

      eventColor: 'white',
      eventTextColor: 'black',
      eventOrder: 'title',
      eventDidMount: (arg: EventMountArg) => {
        this.addFlagImageToEvent(arg);
      },
    };
  }

  private addFlagImageToEvent(arg: EventMountArg): void {
    const titleDiv = arg.el.getElementsByClassName('fc-event-title');
    if (titleDiv.length > 0) {
      const image = arg.event.extendedProps['image'];
      titleDiv[0].before(this.createEventImgElement(image));
    }
  }

  private addTooltipToDay(arg: DayCellMountArg): void {
    const element: HTMLDivElement = document.createElement('div');
    element.classList.add('day_detail_tooltip');
    element.classList.add('day_detail_tooltip_location');
    arg.el.appendChild(element);

    arg.el.addEventListener('mouseenter', (event: MouseEvent) => {
      const td: HTMLTableCellElement = <HTMLTableCellElement>event.target;
      const elements = td.getElementsByClassName('day_detail_tooltip');
      if (elements.length < 1) {
        return;
      }

      const element = <HTMLElement>elements[0];
      element.innerHTML = '';

      const date = arg.date.getDate().toString().padStart(2, '0');
      const month = (arg.date.getMonth() + 1).toString().padStart(2, '0');
      const key = `${arg.date.getFullYear()}-${month}-${date}`;
      const events = this.eventMap.get(key);

      if (events === undefined) {
        return;
      }

      const div: HTMLDivElement = document.createElement('div');
      element.appendChild(div);
      for (let event of events) {
        const eventDiv: HTMLDivElement = document.createElement('div');
        const eventImg: HTMLImageElement = this.createEventImgElement(
          event['image']
        );

        const eventSpan: HTMLSpanElement = document.createElement('span');
        eventSpan.innerText = `${event.title}: ${event['holiday']}`;

        eventDiv.appendChild(eventImg);
        eventDiv.appendChild(eventSpan);

        div.appendChild(eventDiv);
      }
    });
  }

  private updateEventMap(eventList: EventInput[]): void {
    const newEventMap: Map<string, EventInput[]> = new Map();

    for (const event of eventList) {
      const holidayName = event['holiday'];
      const startDate = new Date(`${event.start?.toString()}`);
      const dateKey = startDate.toISOString().slice(0, 10);

      const events = newEventMap.get(dateKey);
      if (events !== undefined) {
        events.push(event);
      } else {
        newEventMap.set(dateKey, [event]);
      }
    }
    this.eventMap = newEventMap;
  }

  public async getHolidayEvents(): Promise<EventInput[]> {
    const result: EventInput[] = [];

    const { calendarApiDataList } = await chrome.storage.local.get(
      ChromeStorage.CALENDAR_API_DATA_LIST
    );

    if (calendarApiDataList === undefined) {
      console.log('CalendarService: calendarApiDataList empty');
      return result;
    }

    for (const calendarApiData of <CalendarApiData[]>calendarApiDataList) {
      const eventList = this.getHolidayEventsPerCountry(calendarApiData);
      result.push(...eventList);
    }

    this.updateEventMap(result);
    return result;
  }

  private getHolidayEventsPerCountry(
    calendarApiData: CalendarApiData
  ): EventInput[] {
    const eventList: EventInput[] = [];

    const data = calendarApiData.data;
    const country = calendarApiData.country;

    if (data.items === undefined) {
      console.log('CalendarService: getHolidayEvents data.items empty');
      return eventList;
    }

    for (const item of data.items) {
      const event = this.createEvent(item, country);
      if (event !== undefined) {
        eventList.push(event);
      }
    }

    return eventList;
  }

  private createEvent(
    item: Schema$Event,
    country: Country
  ): EventInput | undefined {
    if (
      item.description !== 'Public holiday' ||
      item.summary == null ||
      item.start?.date == null ||
      item.end?.date == null
    ) {
      return;
    }

    const event: EventInput = {
      title: country.label,
      start: item.start.date,
      end: item.end.date,
      image: country.image,
      holiday: item.summary,
    };
    return event;
  }

  private createEventImgElement(image: string): HTMLImageElement {
    const img: HTMLImageElement = document.createElement('img');
    img.src = `${this.COUNTRY_FLAG_PATH}${image}`;
    img.classList.add('country_flag');
    return img;
  }
}
