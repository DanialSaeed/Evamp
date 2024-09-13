import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalAdditionalDialogComponent } from './global-additional-dialog.component';

describe('GlobalAdditionalDialogComponent', () => {
  let component: GlobalAdditionalDialogComponent;
  let fixture: ComponentFixture<GlobalAdditionalDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalAdditionalDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalAdditionalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
