import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardChartDonutComponent } from './dashboard-chart-donut.component';

describe('DashboardChartDonutComponent', () => {
  let component: DashboardChartDonutComponent;
  let fixture: ComponentFixture<DashboardChartDonutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardChartDonutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardChartDonutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
