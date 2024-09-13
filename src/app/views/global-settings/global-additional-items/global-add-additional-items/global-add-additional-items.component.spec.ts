import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalAddAdditionalItemsComponent } from './global-add-additional-items.component';

describe('GlobalAddAdditionalItemsComponent', () => {
  let component: GlobalAddAdditionalItemsComponent;
  let fixture: ComponentFixture<GlobalAddAdditionalItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalAddAdditionalItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalAddAdditionalItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
