import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CountryPickerComponent } from './country-picker/country-picker.component';
import { CountrySearchComponent } from './country-search/country-search.component';
import { OptionsComponent } from './options.component';
import { WatchListComponent } from './watch-list/watch-list.component';

@NgModule({
  declarations: [
    OptionsComponent,
    WatchListComponent,
    CountryPickerComponent,
    CountrySearchComponent,
  ],
  imports: [BrowserModule],
})
export class OptionsModule {}
