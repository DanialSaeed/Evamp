import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnbookedSessionsComponent } from './unbooked-sessions.component';

describe('UnbookedSessionsComponent', () => {
  let component: UnbookedSessionsComponent;
  let fixture: ComponentFixture<UnbookedSessionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnbookedSessionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnbookedSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
