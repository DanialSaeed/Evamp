import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFoooterComponent } from './form-foooter.component';

describe('FormFoooterComponent', () => {
  let component: FormFoooterComponent;
  let fixture: ComponentFixture<FormFoooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormFoooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFoooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
