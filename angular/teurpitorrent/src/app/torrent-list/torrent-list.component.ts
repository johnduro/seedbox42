import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Torrent } from '../torrents/torrent';
import { TorrentsService } from '../torrents/torrents.service';
import { SocketService } from '../socket/socket.service';
import { FormsModule } from '@angular/forms';
import { FilesService } from '../files/files.service';
import { faSearch, faTrash, faPlay, faPause, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-torrent-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule
  ],
  templateUrl: './torrent-list.component.html',
  styleUrl: './torrent-list.component.scss'
})
export class TorrentListComponent implements OnInit {
  readonly PAUSED = 0;
  readonly QUEUED_TO_VERIFY_LOCAL_DATA = 1;
  readonly VERIFYING_LOCAL_DATA = 2;
  readonly QUEUED_TO_DOWNLOAD = 3;
  readonly DOWNLOADING = 4;
  readonly QUEUED_TO_SEED = 5;
  readonly SEEDING = 6;

  readonly STATUS_ALL = 'all';
  readonly STATUS_ACTIVE = 'active';
  readonly STATUS_DOWNLOADING = 'downloading';
  readonly STATUS_SEEDING = 'seeding';
  readonly STATUS_PAUSED = 'paused';
  readonly STATUS_FINISHED = 'finished';

  readonly ETA_NOT_AVAILABLE = -1;
  readonly ETA_UNKNOWN = -2;

  torrents: Torrent[] = [];
  filteredTorrents: Torrent[] = [];
  selectedTorrents: Torrent[] = [];
  search: string = '';
  selectedStatus: string = 'all';
  isCheckboxAllSelected: boolean = false;
  contextMenuVisible: boolean = false;
  contextMenuStyle: any = {};
  selectedTorrent: Torrent | null = null;

  faSearch = faSearch;
  faTrash = faTrash;
  faPlay = faPlay;
  faPause = faPause;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;

  private globalClickListener!: () => void;

  constructor(
    private torrentsService: TorrentsService,
    private socketService: SocketService,
    private filesService: FilesService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.torrentsService.getAllTorrents().subscribe(torrents => {
      this.torrents = torrents;
      this.filteredTorrents = this.torrents;
    });


    this.socketService.onEvent('torrentRefreshRes', (msg) => {
      if (msg && msg.torrents) {
        if (msg.torrents) {
          this.updateTorrents(msg.torrents);
        }
        if (msg.removed) {
          const removedIds = msg.removed;
          this.torrents = this.torrents.filter(torrent => !removedIds.includes(torrent.id));
          this.updateFilteredTorrents();
        }
      }
    });

    this.socketService.onEvent('torrentErrorRefresh', (msg) => {
      console.log('TorrentListComponent.torrentErrorRefresh', msg);
    });

    this.socketService.sendEvent('torrentRefresh', {});

    this.globalClickListener = this.renderer.listen('document', 'click', () => {
      this.hideContextMenu();
    });
  }

  ngOnDestroy(): void {
    this.socketService.sendEvent('torrentStopRefresh', {});
  }


  selectAllTorrents(): void {
    this.filteredTorrents.forEach(torrent => torrent.isSelected = this.isCheckboxAllSelected);
    this.updateSelectedTorrents();
  }

  filterTorrents(): void {
    this.updateFilteredTorrents();
  }

  filterTorrentsByStatus(): void {
    this.updateFilteredTorrents();
  }

  updateFilteredTorrents(): void {
    this.filteredTorrents = this.torrents
      .filter(torrent => this.doesTorrentMatchStatus(torrent) && this.doesTorrentMatchSearch(torrent))
      .sort((a, b) => b.activityDate - a.activityDate);
  }

  private doesTorrentMatchStatus(torrent: Torrent): boolean {
    switch (this.selectedStatus) {
      case this.STATUS_ALL:
        return true;
      case this.STATUS_ACTIVE:
        return torrent.status === this.DOWNLOADING || torrent.status === this.SEEDING;
      case this.STATUS_DOWNLOADING:
        return torrent.status === this.DOWNLOADING;
      case this.STATUS_SEEDING:
        return torrent.status === this.SEEDING;
      case this.STATUS_PAUSED:
        return torrent.status === this.PAUSED;
      case this.STATUS_FINISHED:
        return torrent.isFinished;
      default:
        return true;
    }
  }

  private doesTorrentMatchSearch(torrent: Torrent): boolean {
    return torrent.name.toLowerCase().includes(this.search.toLowerCase());
  }

  updateSelectedTorrents(): void {
    this.selectedTorrents = this.torrents.filter(torrent => torrent.isSelected);
  }

  removeSelectedTorrents(event: Event): void {
    event.preventDefault();
    const ids = this.selectedTorrents.map(torrent => torrent.id);
    this.torrentsService.removeTorrent(ids, false).subscribe({
      next: (response) => {
        this.socketService.sendEvent('torrentRefresh', {});
      },
      error: (error) => {
        console.error('Error removing torrents:', error);
      }
    });
  }

  resumeSelectedTorrents(event: Event): void {
    event.preventDefault();
    const ids = this.selectedTorrents.map(torrent => torrent.id);
    this.torrentsService.resumeTorrent(ids).subscribe({
      next: (response) => {
        this.socketService.sendEvent('torrentRefresh', {});
      },
      error: (error) => {
        console.error('Error removing torrents:', error);
      }
    });
  }

  pauseSelectedTorrents(event: Event): void {
    event.preventDefault();
    const ids = this.selectedTorrents.map(torrent => torrent.id);
    this.torrentsService.pauseTorrent(ids).subscribe({
      next: (response) => {
        this.socketService.sendEvent('torrentRefresh', {});
      },
      error: (error) => {
        console.error('Error removing torrents:', error);
      }
    });
  }

  checkboxSwitch(torrentId: number): void {
    this.updateSelectedTorrents();
  }

  convertSize(size: number): string {
    return this.filesService.convertSize(size);
  }

  renderProgressBar(torrent: Torrent): string {
    if (torrent.isFinished) {
      return 'ts-progressbar-finished';
    } else if (torrent.isStalled || torrent.status === 0 || torrent.status === 1 || torrent.status === 3 || torrent.status === 5) {
      return 'ts-progressbar-inactive';
    } else {
      return 'ts-progressbar-active';
    }
  }

  convertTorrentETA(eta: number): string {
    if (eta === this.ETA_NOT_AVAILABLE) {
      return 'Time remaining not available';
    } else if (eta === this.ETA_UNKNOWN) {
      return 'Time remaining unknown';
    } else if (eta < 60) {
      return `${eta} seconds remaining`;
    } else if (eta < 3600) {
      const minutes = Math.floor(eta / 60);
      return `${minutes} minutes remaining`;
    } else if (eta < 86400) {
      const hours = Math.floor(eta / 3600);
      const minutes = Math.floor((eta % 3600) / 60);
      return `${hours} hours ${minutes} minutes remaining`;
    } else {
      const days = Math.floor(eta / 86400);
      const hours = Math.floor((eta % 86400) / 3600);
      const minutes = Math.floor((eta % 3600) / 60);
      return `${days} days ${hours} hours ${minutes} minutes remaining`;
    }
  }

  onRightClick(event: MouseEvent, torrent: Torrent): void {
    event.preventDefault();
    this.selectedTorrent = torrent;
    this.contextMenuStyle = {
      position: 'fixed',
      top: `${event.clientY}px`,
      left: `${event.clientX}px`
    };
    this.contextMenuVisible = true;
  }

  hideContextMenu(): void {
    this.contextMenuVisible = false;
  }

  pauseTorrent(torrent: Torrent): void {
    this.contextMenuVisible = false;
    this.torrentsService.pauseTorrent([torrent.id]).subscribe({
      next: (response) => {
        this.socketService.sendEvent('torrentRefresh', {});
      },
      error: (error) => {
        console.error('Error removing torrents:', error);
      }
    });
  }

  resumeTorrent(torrent: Torrent): void {
    this.contextMenuVisible = false;
    this.torrentsService.resumeTorrent([torrent.id]).subscribe({
      next: (response) => {
        this.socketService.sendEvent('torrentRefresh', {});
      },
      error: (error) => {
        console.error('Error removing torrents:', error);
      }
    });
  }

  moveToTop(torrent: Torrent): void {
    this.contextMenuVisible = false;
    this.torrentsService.moveTorrentToTop([torrent.id]).subscribe({
      next: (response) => {
        this.socketService.sendEvent('torrentRefresh', {});
      },
      error: (error) => {
        console.error('Error moving torrent to top:', error);
      }
    });
  }

  moveUp(torrent: Torrent): void {
    this.contextMenuVisible = false;
    this.torrentsService.moveTorrentUp([torrent.id]).subscribe({
      next: (response) => {
        this.socketService.sendEvent('torrentRefresh', {});
      },
      error: (error) => {
        console.error('Error moving torrent up:', error);
      }
    });
  }

  moveDown(torrent: Torrent): void {
    this.contextMenuVisible = false;
    this.torrentsService.moveTorrentDown([torrent.id]).subscribe({
      next: (response) => {
        this.socketService.sendEvent('torrentRefresh', {});
      },
      error: (error) => {
        console.error('Error moving torrent down:', error);
      }
    });
  }

  moveToBottom(torrent: Torrent): void {
    this.contextMenuVisible = false;
    this.torrentsService.moveTorrentToBottom([torrent.id]).subscribe({
      next: (response) => {
        this.socketService.sendEvent('torrentRefresh', {});
      },
      error: (error) => {
        console.error('Error moving torrent to bottom:', error);
      }
    });
  }

  removeFromList(torrent: Torrent): void {
    this.contextMenuVisible = false;
    this.torrentsService.removeTorrent([torrent.id], false).subscribe({
      next: (response) => {
        this.socketService.sendEvent('torrentRefresh', {});
      },
      error: (error) => {
        console.error('Error removing torrents:', error);
      }
    });
  }

  trashDataAndRemoveFromList(torrent: Torrent): void {
    this.contextMenuVisible = false;
    this.torrentsService.removeTorrent([torrent.id], true).subscribe({
      next: (response) => {
        this.socketService.sendEvent('torrentRefresh', {});
      },
      error: (error) => {
        console.error('Error removing torrents:', error);
      }
    });
  }

  verifyLocalData(torrent: Torrent): void {
    this.contextMenuVisible = false;
    this.torrentsService.verifyTorrentLocalData([torrent.id]).subscribe({
      next: (response) => {
        this.socketService.sendEvent('torrentRefresh', {});
      },
      error: (error) => {
        console.error('Error removing torrents:', error);
      }
    });
  }

  askTrackersForMorePeers(torrent: Torrent): void {
    this.contextMenuVisible = false;
    this.torrentsService.askTrackerForMorePeers([torrent.id]).subscribe({
      next: (response) => {
        this.socketService.sendEvent('torrentRefresh', {});
      },
      error: (error) => {
        console.error('Error removing torrents:', error);
      }
    });
  }

  private updateTorrents(updatedTorrents: Torrent[]): void {
    updatedTorrents.forEach(updatedTorrent => {
      const index = this.torrents.findIndex(torrent => torrent.id === updatedTorrent.id);
      if (index !== -1) {
        updatedTorrent.isSelected = this.torrents[index].isSelected;
        this.torrents[index] = updatedTorrent;
      } else {
        this.torrents.push(updatedTorrent);
      }
    });
    this.updateFilteredTorrents();
  }
}
