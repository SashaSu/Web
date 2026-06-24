import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChefLayout } from './chef-layout';

describe('ChefLayout', () => {
  let component: ChefLayout;
  let fixture: ComponentFixture<ChefLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChefLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChefLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
