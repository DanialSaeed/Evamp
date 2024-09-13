import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddManualAttendanceDialogComponent } from './add-manual-attendance-dialog.component';

describe('AddManualAttendanceDialogComponent', () => {
  let component: AddManualAttendanceDialogComponent;
  let fixture: ComponentFixture<AddManualAttendanceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddManualAttendanceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddManualAttendanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
