import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAdditionalItemsComponent } from './add-additional-items.component';

describe('AddAdditionalItemsComponent', () => {
  let component: AddAdditionalItemsComponent;
  let fixture: ComponentFixture<AddAdditionalItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAdditionalItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAdditionalItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
