import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OffboardFundingInfoComponent } from './offboard-funding-info.component';

describe('OffboardFundingInfoComponent', () => {
  let component: OffboardFundingInfoComponent;
  let fixture: ComponentFixture<OffboardFundingInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OffboardFundingInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OffboardFundingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
