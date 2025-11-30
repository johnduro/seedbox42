import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardChatComponent } from './dashboard-chat.component';

describe('DashboardChatComponent', () => {
  let component: DashboardChatComponent;
  let fixture: ComponentFixture<DashboardChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
