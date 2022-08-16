import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { CalendarOptions } from '@fullcalendar/angular';
import { CalendarApiData } from 'src/app/model/CalendarApiData';
import { ChromeStorage } from 'src/app/model/enum/ChromeStorage';
import { FullCalendarService } from '../services/full-calendar.service';

@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupComponent implements OnInit {
  public calendarOptions: CalendarOptions = {};
  public isLoadingHolidays: boolean = false;
  public isNoCountrySelected: boolean = false;
  public readonly popupMessage: string =
    "No Country/Location is selected. Let's select it from the Options Page.";

  constructor(
    private fullCalendarService: FullCalendarService,
    private cd: ChangeDetectorRef
  ) {
    this.calendarOptions = this.fullCalendarService.getCalendarOptions();

    chrome.storage.onChanged.addListener(async (changes, area) => {
      const newValue: CalendarApiData[] | undefined =
        changes[ChromeStorage.CALENDAR_API_DATA_LIST]?.newValue;

      if (area === 'local' && newValue !== undefined) {
        this.calendarOptions.events =
          await this.fullCalendarService.getHolidayEvents(newValue);

        this.isNoCountrySelected = newValue.length === 0 ? true : false;
        this.cd.detectChanges();
      }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      const isLoadingHolidays: boolean | undefined =
        changes[ChromeStorage.IS_LOADING_HOLIDAYS]?.newValue;
      if (area === 'local' && isLoadingHolidays !== undefined) {
        this.isLoadingHolidays = isLoadingHolidays;
        this.cd.detectChanges();
      }
    });
  }

  public async ngOnInit(): Promise<void> {
    const { calendarApiDataList } = await chrome.storage.local.get(
      ChromeStorage.CALENDAR_API_DATA_LIST
    );

    if (calendarApiDataList === undefined) {
      console.log('CalendarService: calendarApiDataList empty');
      return;
    }

    this.isNoCountrySelected = calendarApiDataList.length === 0 ? true : false;

    this.calendarOptions.events =
      await this.fullCalendarService.getHolidayEvents(calendarApiDataList);

    const { isLoadingHolidays } = await chrome.storage.local.get(
      ChromeStorage.IS_LOADING_HOLIDAYS
    );
    if (isLoadingHolidays !== undefined) {
      this.isLoadingHolidays = isLoadingHolidays;
    }
  }
}
