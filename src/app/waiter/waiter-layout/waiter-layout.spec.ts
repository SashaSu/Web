import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiterLayout } from './waiter-layout';

describe('WaiterLayout', () => {
  let component: WaiterLayout;
  let fixture: ComponentFixture<WaiterLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaiterLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaiterLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
