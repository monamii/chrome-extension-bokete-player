import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CalendarOptions } from '@fullcalendar/angular';
import { CalendarApiData } from 'src/app/model/CalendarApiData';
import { ChromeStorage } from 'src/app/model/enum/ChromeStorage';
import { Area, StorageChange } from 'src/app/model/type/ChromeSupplementalType';
import { FullCalendarService } from '../services/full-calendar.service';

@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupComponent implements OnInit {
  public calendarOptions: CalendarOptions = {};
  @ViewChild('dayTooltip') dayTooltip!: ElementRef<HTMLSpanElement>;

  constructor(private fullCalendarService: FullCalendarService) {
    this.calendarOptions = this.fullCalendarService.getCalendarOptions();
  }

  public async ngOnInit(): Promise<void> {
    this.calendarOptions.events =
      await this.fullCalendarService.getHolidayEvents();

    const changeEvent = async (
      changes: { [key: string]: StorageChange },
      area: Area
    ) => {
      const newValue: CalendarApiData[] | undefined =
        changes[ChromeStorage.CALENDAR_API_DATA_LIST]?.newValue;

      if (area === 'local' && newValue !== undefined) {
        this.calendarOptions.events =
          await this.fullCalendarService.getHolidayEvents();
      }
    };
    chrome.storage.onChanged.addListener(changeEvent);
  }
}
