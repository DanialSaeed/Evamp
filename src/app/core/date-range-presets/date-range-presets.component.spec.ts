import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateRangePresetsComponent } from './date-range-presets.component';

describe('DateRangePresetsComponent', () => {
  let component: DateRangePresetsComponent;
  let fixture: ComponentFixture<DateRangePresetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateRangePresetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateRangePresetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
