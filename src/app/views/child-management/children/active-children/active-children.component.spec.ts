import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveChildrenComponent } from './active-children.component';

describe('ActiveChildrenComponent', () => {
  let component: ActiveChildrenComponent;
  let fixture: ComponentFixture<ActiveChildrenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveChildrenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveChildrenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
