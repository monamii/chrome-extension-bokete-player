import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Country } from 'src/app/model/Country';
import * as List from 'list.js';
import * as countryOptionsData from 'src/assets/data/countryOptions.json';
import { CountryOptions } from 'src/app/model/CountryOptions';
import { ChromeStorage } from 'src/app/model/enum/ChromeStorage';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit {
  @ViewChild('countryOptionsArea')
  countryOptionsArea!: ElementRef<HTMLUListElement>;

  public watchList: Map<string, Country> = new Map();
  public sortedWatchList: Country[] = [];
  public selectedCountries: Map<string, Country> = new Map();
  public countryOptions: CountryOptions;

  constructor() {
    this.countryOptions = countryOptionsData;
  }

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

  public onCountryClick(event: Event, country: Country) {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    if (input.getAttribute('disabled') === 'true') {
      return;
    }

    if (this.selectedCountries.has(country.code)) {
      this.selectedCountries.delete(country.code);
    } else {
      this.selectedCountries.set(country.code, country);
    }
  }

  public async onAddButtonClick() {
    for (let coutry of this.selectedCountries.values()) {
      this.watchList.set(coutry.code, coutry);
    }

    this.selectedCountries.clear();

    this.sortedWatchList = Array.from(this.watchList.values()).sort(
      (a: Country, b: Country) => {
        return a.label.localeCompare(b.label);
      }
    );

    await chrome.storage.sync.set({
      [ChromeStorage.WATCH_LIST]: this.sortedWatchList,
    });
  }

  public async onDeleteClick(country: Country): Promise<void> {
    this.watchList.delete(country.code);
    this.sortedWatchList = Array.from(this.watchList.values());
    await chrome.storage.sync.set({ watchList: this.sortedWatchList });
  }

  public async onRegionClick(event: Event): Promise<void> {
    const element = <HTMLSpanElement>event.target;

    element.nextElementSibling?.toggleAttribute('active');
    element.toggleAttribute('active');
  }
}
