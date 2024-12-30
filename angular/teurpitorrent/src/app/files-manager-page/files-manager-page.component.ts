import { Component } from '@angular/core';
import { FileListManagerComponent } from '../file-list-manager/file-list-manager.component';
import { FilesService } from '../files/files.service';
import { File } from '../files/file';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-files-manager-page',
  standalone: true,
  imports: [
    FileListManagerComponent,
    FontAwesomeModule
  ],
  templateUrl: './files-manager-page.component.html',
  styleUrl: './files-manager-page.component.scss'
})
export class FilesManagerPageComponent {
  files: File[] = [];

  faCheck = faCheck;

  constructor(private fileService: FilesService) { }

  ngOnInit(): void {
    this.getFiles();
  }

  deleteUnlocked(): void {
    const unlockedFiles = this.files.filter(file => !file.isLocked).map(file => file._id);
    if (unlockedFiles.length > 0) {
      this.fileService.deleteFromDatabaseAndServer(unlockedFiles).subscribe({
        next: (response) => {
          this.updateFiles();
        },
        error: (error) => {
          console.error('Error deleting unlocked files:', error);
        }
      });
    } else {
      console.log('No unlocked files to delete.');
    }
  }

  updateFiles(): void {
    this.getFiles();
  }

  private getFiles(): void {
    this.fileService.getAllFinishedFiles().subscribe(files => {
      this.files = files;
    });
  }
}
