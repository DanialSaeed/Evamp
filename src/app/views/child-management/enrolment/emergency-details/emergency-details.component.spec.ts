import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyDetailsComponent } from './emergency-details.component';

describe('EmergencyDetailsComponent', () => {
  let component: EmergencyDetailsComponent;
  let fixture: ComponentFixture<EmergencyDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmergencyDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
