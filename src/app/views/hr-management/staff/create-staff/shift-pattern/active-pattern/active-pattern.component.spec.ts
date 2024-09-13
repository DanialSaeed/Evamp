import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivePatternComponent } from './active-pattern.component';

describe('ActivePatternComponent', () => {
  let component: ActivePatternComponent;
  let fixture: ComponentFixture<ActivePatternComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivePatternComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivePatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
