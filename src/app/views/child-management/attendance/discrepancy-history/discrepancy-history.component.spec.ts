import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscrepancyHistoryComponent } from './discrepancy-history.component';

describe('DiscrepancyHistoryComponent', () => {
  let component: DiscrepancyHistoryComponent;
  let fixture: ComponentFixture<DiscrepancyHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscrepancyHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscrepancyHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
