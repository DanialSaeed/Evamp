import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedGuardiansComponent } from './linked-guardians.component';

describe('LinkedGuardiansComponent', () => {
  let component: LinkedGuardiansComponent;
  let fixture: ComponentFixture<LinkedGuardiansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkedGuardiansComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkedGuardiansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
