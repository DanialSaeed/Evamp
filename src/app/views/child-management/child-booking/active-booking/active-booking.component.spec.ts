import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveBookingComponent } from './active-booking.component';

describe('ActiveBookingComponent', () => {
  let component: ActiveBookingComponent;
  let fixture: ComponentFixture<ActiveBookingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveBookingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
