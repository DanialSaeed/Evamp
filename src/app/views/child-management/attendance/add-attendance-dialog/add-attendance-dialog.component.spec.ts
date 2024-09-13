import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAttendanceDialogComponent } from './add-attendance-dialog.component';

describe('AddAttendanceDialogComponent', () => {
  let component: AddAttendanceDialogComponent;
  let fixture: ComponentFixture<AddAttendanceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAttendanceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAttendanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
