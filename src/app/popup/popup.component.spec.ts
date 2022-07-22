import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PopupComponent } from './popup.component';

describe('PopupComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [PopupComponent],
    }).compileComponents();
  });

  it('should create the popup', () => {
    const fixture = TestBed.createComponent(PopupComponent);
    const popup = fixture.componentInstance;
    expect(popup).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(PopupComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain(
      'chrome-extension-with-angular popup is running!'
    );
  });
});
