import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectChildrenComponent } from './select-children.component';

describe('SelectChildrenComponent', () => {
  let component: SelectChildrenComponent;
  let fixture: ComponentFixture<SelectChildrenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectChildrenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectChildrenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
