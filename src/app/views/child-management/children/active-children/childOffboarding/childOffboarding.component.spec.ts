import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildOffboardingComponent } from './childOffboarding.component';

describe('ChildOffboardingComponent', () => {
  let component: ChildOffboardingComponent;
  let fixture: ComponentFixture<ChildOffboardingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildOffboardingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildOffboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
