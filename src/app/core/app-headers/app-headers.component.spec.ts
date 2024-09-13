import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppHeadersComponent } from './app-headers.component';

describe('AppHeadersComponent', () => {
  let component: AppHeadersComponent;
  let fixture: ComponentFixture<AppHeadersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppHeadersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppHeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
