import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffAttendanceDialogComponent } from './staff-attendance-dialog.component';

describe('StaffAttendanceDialogComponent', () => {
  let component: StaffAttendanceDialogComponent;
  let fixture: ComponentFixture<StaffAttendanceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffAttendanceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffAttendanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
