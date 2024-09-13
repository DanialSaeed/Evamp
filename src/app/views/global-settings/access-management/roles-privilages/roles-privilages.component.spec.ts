import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesPrivilagesComponent } from './roles-privilages.component';

describe('RolesPrivilagesComponent', () => {
  let component: RolesPrivilagesComponent;
  let fixture: ComponentFixture<RolesPrivilagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RolesPrivilagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesPrivilagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
