import { Component } from '@angular/core';
import { FileListComponent } from '../file-list/file-list.component';
import { FilesService } from '../files/files.service';
import { File } from '../files/file';

@Component({
  selector: 'app-files-page',
  standalone: true,
  imports: [FileListComponent],
  templateUrl: './files-page.component.html',
  styleUrl: './files-page.component.scss'
})
export class FilesPageComponent {
  files: File[] = [];

  constructor(private fileService: FilesService) { }

  ngOnInit(): void {
    this.fileService.getAllFinishedFiles().subscribe(files => {
      this.files = files;
    });
  }
}
