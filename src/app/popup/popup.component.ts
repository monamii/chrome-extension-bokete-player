import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CalendarOptions, DayCellMountArg, EventInput, FullCalendarComponent } from '@fullcalendar/angular';
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
    console.log('ngOnInit');
    
    this.calendarOptions.events = await this.getHolidayEvents();

    const changeEvent = (changes: {[key: string]: chrome.storage.StorageChange}, area: 'local' | 'sync' | "managed" | "session") => {
      const newValue: CalendarApiData[] | undefined = changes['calendarApiDataList']?.newValue;
      const oldValue: CalendarApiData[] | undefined = changes['calendarApiDataList']?.oldValue;
      console.log('changeEvent', newValue !== oldValue, newValue, oldValue);
      if (area === 'local' && newValue !== undefined && newValue !== oldValue) {
        console.log('changeEvent inside');
        this.getHolidayEvents().then(
          (events: EventInput[]) => {
            this.calendarOptions.events = events;
          }
        );
        chrome.storage.onChanged.removeListener(changeEvent);
      }
    };
    chrome.storage.onChanged.addListener(changeEvent);
    console.log('ngOnInit end');
  }

  public async getHolidayEvents(): Promise<EventInput[]> {
    const eventList: EventInput[] = [];
    const {calendarApiDataList} = await chrome.storage.local.get('calendarApiDataList');

    console.log('getHolidayEvents', calendarApiDataList);
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
              title: `${country.label}: ${item.summary}`,
              date: dateKey,
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
