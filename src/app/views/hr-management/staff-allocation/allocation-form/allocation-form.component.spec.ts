import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationFormComponent } from './allocation-form.component';

describe('AllocationFormComponent', () => {
  let component: AllocationFormComponent;
  let fixture: ComponentFixture<AllocationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllocationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
