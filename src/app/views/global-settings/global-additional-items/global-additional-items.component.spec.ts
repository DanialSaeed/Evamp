import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalAdditionalItemsComponent } from './global-additional-items.component';

describe('GlobalAdditionalItemsComponent', () => {
  let component: GlobalAdditionalItemsComponent;
  let fixture: ComponentFixture<GlobalAdditionalItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalAdditionalItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalAdditionalItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
