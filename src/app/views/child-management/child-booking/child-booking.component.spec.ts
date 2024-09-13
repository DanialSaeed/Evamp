import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildBookingComponent } from './child-booking.component';

describe('ChildBookingComponent', () => {
  let component: ChildBookingComponent;
  let fixture: ComponentFixture<ChildBookingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildBookingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
