import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdhocInvoiceComponent } from './adhoc-invoice.component';

describe('AdhocInvoiceComponent', () => {
  let component: AdhocInvoiceComponent;
  let fixture: ComponentFixture<AdhocInvoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdhocInvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdhocInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
