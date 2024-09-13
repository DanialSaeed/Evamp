import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildAttendanceDialogComponent } from './child-attendance-dialog.component';

describe('ChildAttendanceDialogComponent', () => {
  let component: ChildAttendanceDialogComponent;
  let fixture: ComponentFixture<ChildAttendanceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildAttendanceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildAttendanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
