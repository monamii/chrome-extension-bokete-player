import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Country } from 'src/app/model/Country';
import * as List from 'list.js';
import { ChromeStorage } from 'src/app/model/enum/ChromeStorage';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit {
  public watchList: Map<string, Country> = new Map();
  public sortedWatchList: Country[] = [];

  async ngOnInit(): Promise<void> {
    const { watchList } = await chrome.storage.sync.get(
      ChromeStorage.WATCH_LIST
    );
    for (const country of watchList as Country[]) {
      this.watchList.set(country.code, country);
    }
    this.sortedWatchList = Array.from(this.watchList.values());

    this.createFullCalendar();
  }

  private createFullCalendar(): void {
    new List('country_picker_wrapper', {
      valueNames: ['country_option'],
    });
  }

  public handleWatchListEvent(event: Map<string, Country>) {
    this.watchList = event;
  }

  public handleSortedWatchListEvent(event: Country[]) {
    this.sortedWatchList = event;
  }
}
