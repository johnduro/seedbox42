import { Component } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TorrentsService } from '../torrents/torrents.service';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FileUploadModule, FileUploader } from 'ng2-file-upload';


@Component({
  selector: 'app-torrent-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule,
    FileUploadModule
  ],
  templateUrl: './torrent-add.component.html',
  styleUrl: './torrent-add.component.scss'
})
export class TorrentAddComponent {
  selectedFile: File | null = null;
  torrentUrl: string = '';
  files: File[] = [];

  faCheck = faCheck;

  constructor(private torrentService: TorrentsService) {
  }

  onTorrentFilesdropped(event: File[]): void {
    this.handleTorrentFiles(event);
  }

  onTorrentFilesSelected(event: File[]): void {
    this.handleTorrentFiles(event);
  }

  sendTorrentUrl(): void {
    if (!this.torrentUrl) {
      return;
    }

    this.torrentService.addTorrentWithUrl(this.torrentUrl).subscribe({
      next: (response) => {
        this.torrentUrl = '';
      },
      error: (error) => {
        console.error('Error adding torrent:', error);
      }
    });
  }

  private handleTorrentFiles(files: File[]): void {
    for (const file of files) {
      if (file.name.endsWith('.torrent')) {
        this.torrentService.addTorrentWithFile(file).subscribe({
          next: (response) => {
          },
          error: (error) => {
            console.error('Error adding torrent:', error);
          }
        });
      } else {
        console.error('Invalid file type:', file.name);
      }
    }
  }
}
