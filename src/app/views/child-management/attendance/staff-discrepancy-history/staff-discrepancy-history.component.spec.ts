import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffDiscrepancyHistoryComponent } from './staff-discrepancy-history.component';

describe('StaffDiscrepancyHistoryComponent', () => {
  let component: StaffDiscrepancyHistoryComponent;
  let fixture: ComponentFixture<StaffDiscrepancyHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffDiscrepancyHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffDiscrepancyHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
