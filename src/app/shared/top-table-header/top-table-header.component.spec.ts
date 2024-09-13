import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopTableHeaderComponent } from './top-table-header.component';

describe('TopTableHeaderComponent', () => {
  let component: TopTableHeaderComponent;
  let fixture: ComponentFixture<TopTableHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopTableHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopTableHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
