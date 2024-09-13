import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectBranchDialogComponent } from './select-branch-dialog.component';

describe('SelectBranchDialogComponent', () => {
  let component: SelectBranchDialogComponent;
  let fixture: ComponentFixture<SelectBranchDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectBranchDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectBranchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
