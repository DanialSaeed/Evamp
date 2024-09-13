import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardiansChildsComponent } from './guardians-childs.component';

describe('GuardiansChildsComponent', () => {
  let component: GuardiansChildsComponent;
  let fixture: ComponentFixture<GuardiansChildsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuardiansChildsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuardiansChildsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
