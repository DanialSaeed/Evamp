import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffAllocationComponent } from './staff-allocation.component';

describe('StaffAllocationComponent', () => {
  let component: StaffAllocationComponent;
  let fixture: ComponentFixture<StaffAllocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffAllocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
