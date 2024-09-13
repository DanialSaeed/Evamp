import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftPatternDialogComponent } from './shift-pattern-dialog.component';

describe('ShiftPatternDialogComponent', () => {
  let component: ShiftPatternDialogComponent;
  let fixture: ComponentFixture<ShiftPatternDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftPatternDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftPatternDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
