import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractSettingsComponent } from './contract-settings.component';

describe('ContractSettingsComponent', () => {
  let component: ContractSettingsComponent;
  let fixture: ComponentFixture<ContractSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
