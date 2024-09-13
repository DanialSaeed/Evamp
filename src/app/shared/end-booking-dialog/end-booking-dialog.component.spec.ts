import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndBookingDialogComponent } from './end-booking-dialog.component';

describe('EndBookingDialogComponent', () => {
  let component: EndBookingDialogComponent;
  let fixture: ComponentFixture<EndBookingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndBookingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndBookingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
