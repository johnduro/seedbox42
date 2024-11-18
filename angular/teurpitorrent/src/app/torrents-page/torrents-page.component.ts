import { Component } from '@angular/core';
import { TorrentListComponent } from '../torrent-list/torrent-list.component';
import { TorrentAddComponent } from '../torrent-add/torrent-add.component';

@Component({
  selector: 'app-torrents-page',
  standalone: true,
  imports: [TorrentListComponent, TorrentAddComponent],
  templateUrl: './torrents-page.component.html',
  styleUrl: './torrents-page.component.scss'
})
export class TorrentsPageComponent {

}
