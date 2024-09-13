import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildAttendanceTableComponent } from './child-attendance-table.component';

describe('ChildAttendanceTableComponent', () => {
  let component: ChildAttendanceTableComponent;
  let fixture: ComponentFixture<ChildAttendanceTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildAttendanceTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildAttendanceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
