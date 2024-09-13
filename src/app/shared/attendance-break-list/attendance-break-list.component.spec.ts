import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceBreakListComponent } from './attendance-break-list.component';

describe('AttendanceBreakListComponent', () => {
  let component: AttendanceBreakListComponent;
  let fixture: ComponentFixture<AttendanceBreakListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendanceBreakListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceBreakListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
