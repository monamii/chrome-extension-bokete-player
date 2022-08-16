import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchListComponent } from './watch-list.component';

describe('OptionsComponent', () => {
  let component: WatchListComponent;
  let fixture: ComponentFixture<WatchListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WatchListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WatchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});