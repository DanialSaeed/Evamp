import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalItemDetailComponent } from './additional-item-detail.component';

describe('AdditionalItemDetailComponent', () => {
  let component: AdditionalItemDetailComponent;
  let fixture: ComponentFixture<AdditionalItemDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdditionalItemDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
