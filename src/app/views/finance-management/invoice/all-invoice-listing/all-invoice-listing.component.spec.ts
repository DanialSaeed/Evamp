import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllInvoiceListingComponent } from './all-invoice-listing.component';

describe('AllInvoiceListingComponent', () => {
  let component: AllInvoiceListingComponent;
  let fixture: ComponentFixture<AllInvoiceListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllInvoiceListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllInvoiceListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
