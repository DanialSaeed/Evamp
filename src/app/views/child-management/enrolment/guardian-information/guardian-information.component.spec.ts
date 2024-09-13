import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianInformationComponent } from './guardian-information.component';

describe('GuardianInformationComponent', () => {
  let component: GuardianInformationComponent;
  let fixture: ComponentFixture<GuardianInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuardianInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuardianInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
