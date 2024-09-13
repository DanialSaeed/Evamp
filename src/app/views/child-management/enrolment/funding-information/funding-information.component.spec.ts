import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundingIforrmationComponent } from './funding-information.component';

describe('FundingIforrmationComponent', () => {
  let component: FundingIforrmationComponent;
  let fixture: ComponentFixture<FundingIforrmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FundingIforrmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundingIforrmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
