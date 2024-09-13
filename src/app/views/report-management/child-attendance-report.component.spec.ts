import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildAttendanceReportComponent } from './child-attendance-report.component';

describe('ChildAttendanceReportComponent', () => {
  let component: ChildAttendanceReportComponent;
  let fixture: ComponentFixture<ChildAttendanceReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildAttendanceReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildAttendanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
