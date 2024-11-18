import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TorrentAddComponent } from './torrent-add.component';

describe('TorrentAddComponent', () => {
  let component: TorrentAddComponent;
  let fixture: ComponentFixture<TorrentAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TorrentAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TorrentAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
