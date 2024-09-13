import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingPatterenDialogComponent } from './booking-patteren-dialog.component';

describe('BookingPatterenDialogComponent', () => {
  let component: BookingPatterenDialogComponent;
  let fixture: ComponentFixture<BookingPatterenDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookingPatterenDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingPatterenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
