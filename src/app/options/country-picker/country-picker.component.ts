import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Country } from 'src/app/model/Country';
import { ChromeStorage } from 'src/app/model/enum/ChromeStorage';
import * as countryOptionsData from 'src/assets/data/countryOptions.json';
import { CountryOptions } from 'src/app/model/CountryOptions';

@Component({
  selector: 'app-country-picker',
  templateUrl: './country-picker.component.html',
  styleUrls: [
    './country-picker.component.scss',
    './../options.module.shared.scss',
  ],
})
export class CountryPickerComponent {
  public selectedCountries: Map<string, Country> = new Map();
  public countryOptions: CountryOptions;

  @Input() public watchList!: Map<string, Country>;
  @Input() public sortedWatchList!: Country[];

  @Output() watchListEvent = new EventEmitter<Map<string, Country>>();
  @Output() sortedWatchListEvent = new EventEmitter<Country[]>();

  constructor() {
    this.countryOptions = countryOptionsData;
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

    this.watchListEvent.emit(this.watchList);
    this.sortedWatchListEvent.emit(this.sortedWatchList);
  }

  public async onRegionClick(event: Event): Promise<void> {
    const element = <HTMLSpanElement>event.target;

    element.nextElementSibling?.toggleAttribute('active');
    element.toggleAttribute('active');
  }
}
