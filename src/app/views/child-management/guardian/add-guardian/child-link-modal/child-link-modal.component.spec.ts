import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildLinkModalComponent } from './child-link-modal.component';

describe('ChildLinkModalComponent', () => {
  let component: ChildLinkModalComponent;
  let fixture: ComponentFixture<ChildLinkModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildLinkModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildLinkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
