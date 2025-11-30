import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TorrentListComponent } from './torrent-list.component';

describe('TorrentListComponent', () => {
  let component: TorrentListComponent;
  let fixture: ComponentFixture<TorrentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TorrentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TorrentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
