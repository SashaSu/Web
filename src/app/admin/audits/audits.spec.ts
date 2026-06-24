import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Audits } from './audits';

describe('Audits', () => {
  let component: Audits;
  let fixture: ComponentFixture<Audits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Audits]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Audits);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
