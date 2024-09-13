import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingTypeDialogComponent } from './booking-type-dialog.component';

describe('BookingTypeDialogComponent', () => {
  let component: BookingTypeDialogComponent;
  let fixture: ComponentFixture<BookingTypeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookingTypeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingTypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
