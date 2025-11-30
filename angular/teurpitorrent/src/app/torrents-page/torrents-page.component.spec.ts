import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TorrentsPageComponent } from './torrents-page.component';

describe('TorrentsPageComponent', () => {
  let component: TorrentsPageComponent;
  let fixture: ComponentFixture<TorrentsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TorrentsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TorrentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
