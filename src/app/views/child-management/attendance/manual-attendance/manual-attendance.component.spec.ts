import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualAttendanceComponent } from './manual-attendance.component';

describe('ManualAttendanceComponent', () => {
  let component: ManualAttendanceComponent;
  let fixture: ComponentFixture<ManualAttendanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualAttendanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
