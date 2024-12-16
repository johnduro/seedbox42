import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Torrent } from '../torrents/torrent';
import { TorrentsService } from '../torrents/torrents.service';
import { SocketService } from '../socket/socket.service';

@Component({
  selector: 'app-torrent-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './torrent-list.component.html',
  styleUrl: './torrent-list.component.scss'
})
export class TorrentListComponent implements OnInit {
  torrents: Torrent[] = [];

  constructor(private torrentsService: TorrentsService, private socketService: SocketService) { }

  ngOnInit(): void {
    console.log('TorrentListComponent.ngOnInit');

    this.torrentsService.getAllTorrents().subscribe(torrents => {
      console.log('TorrentListComponent.getTorrents', torrents);
      this.torrents = torrents;
    });

    
    this.socketService.onEvent('torrentRefreshRes', (msg) => {
      console.log('TorrentListComponent.torrentRefreshRes', msg);
      if (msg && msg.torrents) {
        this.updateTorrents(msg.torrents);
      }
    });
    
    this.socketService.onEvent('torrentErrorRefresh', (msg) => {
      console.log('TorrentListComponent.torrentErrorRefresh', msg);
    });
    
    this.socketService.sendEvent('torrentRefresh', {});
  }

  ngOnDestroy(): void {
    console.log('TorrentListComponent.ngOnDestroy');
    this.socketService.sendEvent('torrentStopRefresh', {});
  }

  private updateTorrents(updatedTorrents: Torrent[]): void {
    updatedTorrents.forEach(updatedTorrent => {
      const index = this.torrents.findIndex(torrent => torrent.id === updatedTorrent.id);
      if (index !== -1) {
        // Update existing torrent
        this.torrents[index] = updatedTorrent;
      } else {
        // Add new torrent
        this.torrents.push(updatedTorrent);
      }
    });
  }
}
