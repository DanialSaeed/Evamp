import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdhocBookingDetailComponent } from './adhoc-booking-detail.component';

describe('AdhocBookingDetailComponent', () => {
  let component: AdhocBookingDetailComponent;
  let fixture: ComponentFixture<AdhocBookingDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdhocBookingDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdhocBookingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
