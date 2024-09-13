import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalItemsFormDialogComponent } from './additional-items-form-dialog.component';

describe('AdditionalItemsFormDialogComponent', () => {
  let component: AdditionalItemsFormDialogComponent;
  let fixture: ComponentFixture<AdditionalItemsFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdditionalItemsFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalItemsFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
