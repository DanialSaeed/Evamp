import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CacheTestComponent } from './cache-test.component';

describe('CacheTestComponent', () => {
  let component: CacheTestComponent;
  let fixture: ComponentFixture<CacheTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CacheTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CacheTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
