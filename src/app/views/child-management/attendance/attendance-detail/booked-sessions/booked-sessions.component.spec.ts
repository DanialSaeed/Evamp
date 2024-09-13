import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookedSessionsComponent } from './booked-sessions.component';

describe('BookedSessionsComponent', () => {
  let component: BookedSessionsComponent;
  let fixture: ComponentFixture<BookedSessionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookedSessionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookedSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
