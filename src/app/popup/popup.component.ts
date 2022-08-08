import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CalendarOptions,
  DayCellMountArg,
  EventInput,
  EventMountArg,
} from '@fullcalendar/angular';
import { CalendarApiData } from 'src/model/CalendarApiData';
import { ChromeStorage } from 'src/model/enum/ChromeStorage';
import { Area, StorageChange } from 'src/model/type/ChromeSupplementalType';

@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupComponent implements OnInit {
  public calendarOptions: CalendarOptions = {};
  private eventMap: Map<string, Map<string, EventInput>> = new Map();
  @ViewChild('dayTooltip') dayTooltip!: ElementRef<HTMLSpanElement>;

  private readonly COUNTRY_FLAG_PATH: string = 'assets\\images\\flags\\';

  constructor() {
    this.calendarOptions = {
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

  public async ngOnInit(): Promise<void> {
    this.calendarOptions.events = await this.getHolidayEvents();

    const changeEvent = async (
      changes: { [key: string]: StorageChange },
      area: Area
    ) => {
      const newValue: CalendarApiData[] | undefined =
        changes[ChromeStorage.CALENDAR_API_DATA_LIST]?.newValue;

      console.log('popup: CALENDAR_API_DATA_LIST onChanged', newValue);

      if (area === 'local' && newValue !== undefined) {
        this.calendarOptions.events = await this.getHolidayEvents();
      }
    };
    chrome.storage.onChanged.addListener(changeEvent);
  }

  public async getHolidayEvents(): Promise<EventInput[]> {
    const eventList: EventInput[] = [];
    const newEventMap: Map<string, Map<string, EventInput>> = new Map();

    const { calendarApiDataList } = await chrome.storage.local.get(
      ChromeStorage.CALENDAR_API_DATA_LIST
    );

    console.log('popup: getHolidayEvents', calendarApiDataList);

    if (calendarApiDataList === undefined) {
      return eventList;
    }

    for (const calendarApiData of <CalendarApiData[]>calendarApiDataList) {
      const data = calendarApiData.data;
      const country = calendarApiData.country;
      console.log(`popup: getHolidayEvents ${country.label}`);

      if (data.items === undefined) {
        console.log('popup: getHolidayEvents data.items empty');
        continue;
      }

      for (const item of data.items) {
        if (
          item.description === 'Public holiday' &&
          item.summary != null &&
          item.start?.date != null &&
          item.end?.date != null
        ) {
          const startDate = new Date(item.start.date);

          const dateKey = startDate.toISOString().slice(0, 10);
          const holidayName = item.summary;

          const event: EventInput = {
            title: country.label,
            start: item.start.date,
            end: item.end.date,
            image: country.image,
            holiday: holidayName,
          };

          const events = newEventMap.get(dateKey);
          if (events !== undefined) {
            events.set(holidayName, event);
          } else {
            const map = new Map();
            map.set(holidayName, event);
            newEventMap.set(dateKey, map);
          }

          eventList.push(event);
        }
      }
    }
    this.eventMap = newEventMap;
    console.log('getHlidays', this.eventMap);
    return eventList;
  }

  private addFlagImageToEvent(arg: EventMountArg): void {
    const titleDiv = arg.el.getElementsByClassName('fc-event-title');
    if (titleDiv.length > 0) {
      const img = document.createElement('img');
      const image = arg.event.extendedProps['image'];
      img.src = `${this.COUNTRY_FLAG_PATH}${image}`;
      img.classList.add('country_flag');

      titleDiv[0].before(img);
    }
  }

  private addTooltipToDay(arg: DayCellMountArg): void {
    const element: HTMLSpanElement = document.createElement('span');
    element.classList.add('day_detail_tooltip');
    arg.el.appendChild(element);

    const createTooltip = (event: MouseEvent) => {
      const td: HTMLTableCellElement = <HTMLTableCellElement>event.target;
      const elements = td.getElementsByClassName('day_detail_tooltip');
      if (elements.length < 1) {
        return;
      }

      const element = <HTMLElement>elements[0];
      element.innerText = '';

      const date = arg.date.getDate().toString().padStart(2, '0');
      const month = (arg.date.getMonth() + 1).toString().padStart(2, '0');
      const key = `${arg.date.getFullYear()}-${month}-${date}`;
      const events = this.eventMap.get(key);

      if (events !== undefined) {
        let innerText = '';
        for (let event of events.values()) {
          const holiday = event['holiday'];
          innerText += `${event.title}: ${holiday}\n`;
        }
        element.innerText = innerText;
      }
    };

    arg.el.addEventListener('mouseenter', createTooltip);
  }
}
