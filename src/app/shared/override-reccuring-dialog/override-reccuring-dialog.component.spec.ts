import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverrideReccuringDialogComponent } from './override-reccuring-dialog.component';

describe('OverrideReccuringDialogComponent', () => {
  let component: OverrideReccuringDialogComponent;
  let fixture: ComponentFixture<OverrideReccuringDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverrideReccuringDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverrideReccuringDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
