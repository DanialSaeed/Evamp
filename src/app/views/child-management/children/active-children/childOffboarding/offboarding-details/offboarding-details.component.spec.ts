import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OffboardingDetailsComponent } from './offboarding-details.component';

describe('OffboardingDetailsComponent', () => {
  let component: OffboardingDetailsComponent;
  let fixture: ComponentFixture<OffboardingDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OffboardingDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OffboardingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
