import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateRangeHeaderCustomComponent } from './date-range-header-custom.component';

describe('DateRangeHeaderCustomComponent', () => {
  let component: DateRangeHeaderCustomComponent;
  let fixture: ComponentFixture<DateRangeHeaderCustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateRangeHeaderCustomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateRangeHeaderCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
