import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceBookingListingComponent } from './invoice-booking-listing.component';

describe('InvoiceBookingListingComponent', () => {
  let component: InvoiceBookingListingComponent;
  let fixture: ComponentFixture<InvoiceBookingListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceBookingListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceBookingListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
