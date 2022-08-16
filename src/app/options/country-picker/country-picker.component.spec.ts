import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CountryPickerComponent } from './country-picker.component';

describe('OptionsComponent', () => {
  let component: CountryPickerComponent;
  let fixture: ComponentFixture<CountryPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CountryPickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CountryPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
