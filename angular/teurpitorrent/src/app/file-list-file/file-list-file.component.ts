import { Component, Input } from '@angular/core';
import { File, FileClass } from '../files/file';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { faFolderOpen, faMusic, faFilm, faImage, faFileLines, faFile, faHeart, faCircleArrowDown, faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { FilesService } from '../files/files.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FileTypeComponent } from '../file-type/file-type.component';
import { FileDisplayRatingComponent } from '../file-display-rating/file-display-rating.component';

@Component({
  selector: '[app-file-list-file]',
  standalone: true,
  imports: [RouterLink, CommonModule, FontAwesomeModule, FileTypeComponent, FileDisplayRatingComponent],
  templateUrl: './file-list-file.component.html',
  styleUrl: './file-list-file.component.scss'
})
export class FileListFileComponent {
  @Input({ required: true }) fileData!: File;
  @Input() updateFile!: (file: File) => void;

  file: FileClass = {} as FileClass;

  constructor(
    private router: Router,
    private filesService: FilesService
  ) { }

  faFolderOpen = faFolderOpen;
  faMusic = faMusic;
  faFilm = faFilm;
  faImage = faImage;
  faFileLines = faFileLines;
  faFile = faFile;
  faHeart = faHeart;
  faCircleArrowDown = faCircleArrowDown;
  faStar = faStar;
  faStarRegular = faStarRegular;

  ngOnInit(): void {
    this.file = new FileClass(this.fileData);
  }


  openFile(file: File) {
    this.router.navigate(['files', file._id]);
  }

  downloadFile(file: File) {
    this.filesService.getDownloadUrl(file._id, "/", file.name).subscribe((path: string) => {
      window.location.href = path;
    });
  }

  unlockFile(file: File) {
    this.filesService.unlockFile(file._id).subscribe(() => {
      this.filesService.getFile(file._id).subscribe((updatedFile: File) => {
        this.file = new FileClass(updatedFile);
        this.updateFile(updatedFile);
      });
    });
  }

  lockFile(file: File) {
    this.filesService.lockFile(file._id).subscribe(() => {
      this.filesService.getFile(file._id).subscribe((updatedFile: File) => {
        this.file = new FileClass(updatedFile);
        this.updateFile(updatedFile);
      });
    });
  }

  onUserAvatarImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/avatar/default.png';
  }

  getStarIcons(averageGrade: number): any[] {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < averageGrade) {
        stars.push(this.faStar);
      } else {
        stars.push(this.faStarRegular);
      }
    }
    return stars;
  }
}
