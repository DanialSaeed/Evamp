import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleBookingDetailComponent } from './multiple-booking-detail.component';

describe('MultipleBookingDetailComponent', () => {
  let component: MultipleBookingDetailComponent;
  let fixture: ComponentFixture<MultipleBookingDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleBookingDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleBookingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
