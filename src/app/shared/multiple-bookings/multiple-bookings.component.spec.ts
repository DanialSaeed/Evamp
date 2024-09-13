import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleBookingsComponent } from './multiple-bookings.component';

describe('MultipleBookingsComponent', () => {
  let component: MultipleBookingsComponent;
  let fixture: ComponentFixture<MultipleBookingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleBookingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
