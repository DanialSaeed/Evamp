import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalDialogComponent } from './additional-dialog.component';

describe('AdditionalDialogComponent', () => {
  let component: AdditionalDialogComponent;
  let fixture: ComponentFixture<AdditionalDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdditionalDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
