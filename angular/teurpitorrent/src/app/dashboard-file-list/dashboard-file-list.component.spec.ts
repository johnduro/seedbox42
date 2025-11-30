import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFileListComponent } from './dashboard-file-list.component';

describe('DashboardFileListComponent', () => {
  let component: DashboardFileListComponent;
  let fixture: ComponentFixture<DashboardFileListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFileListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardFileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
