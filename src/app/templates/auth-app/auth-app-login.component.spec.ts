import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthAppLoginComponent } from './auth-app-login.component';

describe('AuthAppLoginComponent', () => {
  let component: AuthAppLoginComponent;
  let fixture: ComponentFixture<AuthAppLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthAppLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthAppLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
