import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedChildrenComponent } from './linked-children.component';

describe('LinkedChildrenComponent', () => {
  let component: LinkedChildrenComponent;
  let fixture: ComponentFixture<LinkedChildrenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkedChildrenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkedChildrenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
