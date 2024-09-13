import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionRateHistoryComponent } from './session-rate-history.component';

describe('SessionRateHistoryComponent', () => {
  let component: SessionRateHistoryComponent;
  let fixture: ComponentFixture<SessionRateHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionRateHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionRateHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
