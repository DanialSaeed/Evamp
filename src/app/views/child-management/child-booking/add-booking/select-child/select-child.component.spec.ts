import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectChildComponent } from './select-child.component';

describe('SelectChildComponent', () => {
  let component: SelectChildComponent;
  let fixture: ComponentFixture<SelectChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
