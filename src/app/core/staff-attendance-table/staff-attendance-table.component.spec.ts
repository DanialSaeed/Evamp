import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffAttendanceTableComponent } from './staff-attendance-table.component';

describe('StaffAttendanceTableComponent', () => {
  let component: StaffAttendanceTableComponent;
  let fixture: ComponentFixture<StaffAttendanceTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffAttendanceTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffAttendanceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
