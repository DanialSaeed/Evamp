import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffAttendanceDetailComponent } from './staff-attendance-detail.component';

describe('StaffAttendanceDetailComponent', () => {
  let component: StaffAttendanceDetailComponent;
  let fixture: ComponentFixture<StaffAttendanceDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffAttendanceDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffAttendanceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
