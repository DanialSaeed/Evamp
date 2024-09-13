import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveBookingComponent } from './archive-booking.component';

describe('ArchiveBookingComponent', () => {
  let component: ArchiveBookingComponent;
  let fixture: ComponentFixture<ArchiveBookingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchiveBookingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
