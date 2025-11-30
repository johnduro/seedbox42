import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFolderOpen, faMusic, faFilm, faImage, faFileLines, faFile } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-file-type',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './file-type.component.html',
  styleUrl: './file-type.component.scss'
})
export class FileTypeComponent {
  @Input({ required: true }) type!: string;
  transformedType: string = '';

  faFolderOpen = faFolderOpen;
  faMusic = faMusic;
  faFilm = faFilm;
  faFileLines = faFileLines;
  faImage = faImage;
  faFile = faFile;

  ngOnInit(): void {
    this.transformedType = this.type;
    
    if (!this.type) {
      return;
    }

    if (this.type.startsWith('audio/')) {
      this.transformedType = 'audio';
    } else if (this.type.startsWith('video/')) {
      this.transformedType = 'video';
    } else if (this.type.startsWith('image/')) {
      this.transformedType = 'image';
    }
  }
}
