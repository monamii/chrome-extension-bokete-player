import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Country } from 'src/model/Country';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit {
  @ViewChild("countryOptionsArea")  countryOptionsArea!: ElementRef;

  public watchList: Map<string, Country> = new Map();
  public selectedCountries: Map<string, Country> = new Map();
  public countryOptions: Country[] = [];

  constructor() {
    this.countryOptions.push({
      label: "America",
      code: "usa"
    });
    this.countryOptions.push({
      label: "Australia",
      code: "australian"
    });
    this.countryOptions.push({
      label: "France",
      code: "french"
    });
    this.countryOptions.push({
      label: "India",
      code: "indian"
    });
    this.countryOptions.push({
      label: "Japan",
      code: "japanese"
    });
  }

  ngOnInit(): void {}

  public onCountryClick(event: Event, country: Country){
    const input: HTMLInputElement = event.target as HTMLInputElement;
    input.toggleAttribute('selected');

    if(this.selectedCountries.has(country.code)){
      this.selectedCountries.delete(country.code);
    }else{
      this.selectedCountries.set(country.code, country);
    }

    console.log(this.selectedCountries.keys());
  }

  public onAddButtonClick(){
    for(let coutry of this.selectedCountries.values()){
      this.watchList.set(coutry.code, coutry);
    }
    console.log(this.watchList);

    const element: HTMLElement = this.countryOptionsArea.nativeElement as HTMLElement;
    console.log(element);
    for(let i = 0; i < element.children.length; i++){
      console.log(element.children[i]);
      element.children[i].removeAttribute('selected');
    }
  }
}
