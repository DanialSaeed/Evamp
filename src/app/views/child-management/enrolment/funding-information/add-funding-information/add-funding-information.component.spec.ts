import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFundingInformationComponent } from './add-funding-information.component';

describe('AddFundingInformationComponent', () => {
  let component: AddFundingInformationComponent;
  let fixture: ComponentFixture<AddFundingInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFundingInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFundingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
