import { Component } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TorrentsService } from '../torrents/torrents.service';

@Component({
  selector: 'app-torrent-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './torrent-add.component.html',
  styleUrl: './torrent-add.component.scss'
})
export class TorrentAddComponent {
  torrentForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private torrentService: TorrentsService) {
    this.torrentForm = this.fb.group({ //todo fix this
      torrentUrl: [''],
      torrentFile: [null]
    }, { validators: this.atLeastOneRequired });
   }

  atLeastOneRequired(group: FormGroup): { [key: string]: boolean } | null {
    const torrentUrl = group.get('torrentUrl')?.value;
    const torrentFile = group.get('torrentFile')?.value;
    return torrentUrl || torrentFile ? null : { atLeastOneRequired: true };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.torrentForm.patchValue({ torrentFile: this.selectedFile });
    }
 }

  onSubmit(): void {
    if (this.torrentForm.valid) {
      const torrentUrl = this.torrentForm.get('torrentUrl')?.value;
      if (torrentUrl) {
        console.log('Torrent URL:', torrentUrl);
        this.torrentService.addTorrentWithUrl(torrentUrl).subscribe({
          next: (response) => {
            console.log('Torrent added successfully:', response);
            this.clearForm();
          },
          error: (error) => {
            console.error('Error adding torrent:', error);
          }
        });
      }

      if (this.selectedFile) {
        console.log('Selected File:', this.selectedFile);
        this.torrentService.addTorrentWithFile(this.selectedFile).subscribe({
          next: (response) => {
            console.log('Torrent added successfully:', response);
            this.clearForm();
          },
          error: (error) => {
            console.error('Error adding torrent:', error);
          }
        });
      }
    }
  }

  private clearForm(): void {
    this.torrentForm.reset();
    this.selectedFile = null;
  }
}
