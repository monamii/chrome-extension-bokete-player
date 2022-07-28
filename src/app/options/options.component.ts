import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Country } from 'src/model/Country';
import * as List from 'list.js';
import { Region } from 'src/model/Region';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit {
  @ViewChild("countryOptionsArea")  countryOptionsArea!: ElementRef<HTMLUListElement>;

  public watchList: Map<string, Country> = new Map();
  public selectedCountries: Map<string, Country> = new Map();
  public countryOptions: Region[] = [];

  constructor() {
    this.loadCountryOptions();
  }

  private loadCountryOptions(): void{

    this.countryOptions.push({
      label: "Asia",
      country: [
        {
          label: "India",
          code: "indian"
        },
        {
          label: "Japan",
          code: "japanese"
        },
      ]
    });

    this.countryOptions.push({
      label: "Australia & New Zealand",
      country: [
        {
          label: "Australia",
          code: "australian"
        }
      ]
    });

    this.countryOptions.push({
      label: "Europe",
      country: [
        {
          label: "France",
          code: "french"
        }
      ]
    });

    this.countryOptions.push({
      label: "North America",
      country: [
        {
          label: "America",
          code: "usa"
        }
      ]
    });
  }

  async ngOnInit(): Promise<void> {
    const {watchList} = await chrome.storage.sync.get('watchList');
    for(const country of watchList as Country[]){
      this.watchList.set(country.code, country);
    }

    new List('country_picker_wrapper', { 
      valueNames: ['country_option']
    });
  }

  public onCountryClick(event: Event, country: Country){
    const input: HTMLInputElement = event.target as HTMLInputElement;
    if(input.getAttribute('disabled') === 'true'){
      console.log('return!');
      return;
    }

    input.toggleAttribute('selected');

    if(this.selectedCountries.has(country.code)){
      this.selectedCountries.delete(country.code);
    }else{
      this.selectedCountries.set(country.code, country);
    }

    console.log(this.selectedCountries.keys());
  }

  public async onAddButtonClick(){
    for(let coutry of this.selectedCountries.values()){
      this.watchList.set(coutry.code, coutry);
    }

    this.selectedCountries.clear();

    const element: HTMLUListElement = this.countryOptionsArea.nativeElement;
    const options: HTMLCollectionOf<Element> = element.getElementsByClassName('country_option');
    for(let i = 0; i < options.length; i++){
      options[i].removeAttribute('selected');
    }

    this.watchList = new Map([...this.watchList.entries()].sort((a: [string, Country], b:[string, Country])=>{
      return a[1].label.localeCompare(b[1].label);
    }));

    await chrome.storage.sync.set({watchList: Array.from(this.watchList.values())});
  }

  public async onDeleteClick(country: Country): Promise<void>{
    this.watchList.delete(country.code);
    await chrome.storage.sync.set({watchList: Array.from(this.watchList.values())});
  }

  public async onRegionClick(event: Event): Promise<void>{
    const element = <HTMLSpanElement>event.target;

    element.nextElementSibling?.toggleAttribute('active');
    element.toggleAttribute('active');
  }
}
