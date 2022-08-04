import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CalendarOptions, DayCellMountArg, EventInput, EventMountArg, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarApiData } from 'src/model/CalendarApiData';


@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupComponent implements OnInit {
  public calendarOptions: CalendarOptions = {};
  private eventMap: Map<string, EventInput[]> = new Map();

  private readonly COUNTRY_FLAG_PATH: string = 'assets\\images\\flags\\'; 

  constructor() {
    FullCalendarComponent
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      height: '100%',
      customButtons: {
        optionsButton: {
          text: 'Options',
          click: function() {
            chrome.runtime.openOptionsPage();
          }
        }
      },
      footerToolbar: {
        left: 'optionsButton'
      },
      dayCellDidMount: (arg: DayCellMountArg)=>{
        arg.el.addEventListener('mouseover', (event)=>{

          const date = (arg.date.getDate()).toString().padStart(2, '0');
          const month = (arg.date.getMonth()+1).toString().padStart(2, '0');
          const key = `${arg.date.getFullYear()}-${month}-${date}`;
          const events: EventInput[] | undefined = this.eventMap.get(key);
          if(events !== undefined && arg.el.getElementsByClassName('day_detail_tooltip').length === 0){
  
            let innerText = '';
            for(let event of events){
              const holiday = event['holiday'];
              innerText += `${event.title}: ${holiday}\n`;
            }

            const element: HTMLSpanElement = document.createElement('span');
            element.classList.add('day_detail_tooltip');
            element.innerText = innerText
            arg.el.appendChild(element);
          }
        });
      },
      eventColor: 'white',
      eventTextColor: 'black',
      eventOrder: 'title',
      eventDidMount: (arg: EventMountArg)=>{
        
        const titleDiv = arg.el.getElementsByClassName('fc-event-title');
        if(titleDiv.length > 0){
          const img = document.createElement('img');
          const image = arg.event.extendedProps['image'];
          img.src = `${this.COUNTRY_FLAG_PATH}${image}`;
          img.classList.add('country_flag');

          titleDiv[0].before(img);
        }
      }
    };
  }

  public async ngOnInit(): Promise<void> {
    
    this.calendarOptions.events = await this.getHolidayEvents();

    const changeEvent = (changes: {[key: string]: chrome.storage.StorageChange}, area: 'local' | 'sync' | "managed" | "session") => {
      const newValue: CalendarApiData[] | undefined = changes['calendarApiDataList']?.newValue;
      const oldValue: CalendarApiData[] | undefined = changes['calendarApiDataList']?.oldValue;
      if (area === 'local' && newValue !== undefined && newValue !== oldValue) {
        this.getHolidayEvents().then(
          (events: EventInput[]) => {
            this.calendarOptions.events = events;
          }
        );
        chrome.storage.onChanged.removeListener(changeEvent);
      }
    };
    chrome.storage.onChanged.addListener(changeEvent);
  }

  public async getHolidayEvents(): Promise<EventInput[]> {
    const eventList: EventInput[] = [];
    const {calendarApiDataList} = await chrome.storage.local.get('calendarApiDataList');

    if(calendarApiDataList === undefined){
      console.log('getHolidayEvents empty');
      return eventList;
    }

    for (const calendarApiData of calendarApiDataList) {
      const data = calendarApiData.data;
      const country = calendarApiData.country;

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
              title: country.label,
              date: dateKey,
              image: country.image,
              holiday: item.summary,
            };

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
