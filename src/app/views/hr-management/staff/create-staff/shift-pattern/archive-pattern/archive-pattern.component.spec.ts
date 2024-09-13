import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivePatternComponent } from './archive-pattern.component';

describe('ArchivePatternComponent', () => {
  let component: ArchivePatternComponent;
  let fixture: ComponentFixture<ArchivePatternComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchivePatternComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivePatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
