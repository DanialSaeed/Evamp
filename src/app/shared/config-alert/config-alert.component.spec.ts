import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigAlertComponent } from './config-alert.component';

describe('ConfigAlertComponent', () => {
  let component: ConfigAlertComponent;
  let fixture: ComponentFixture<ConfigAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
