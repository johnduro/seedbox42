import { Component } from '@angular/core';
import { FilesService } from '../files/files.service';
import { File } from '../files/file';
import { CommonModule } from '@angular/common';
import { FileListFileComponent } from '../file-list-file/file-list-file.component';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule, FileListFileComponent],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.scss'
})
export class FileListComponent {
  files: File[] = [];

  constructor(private fileService: FilesService) { }

  ngOnInit(): void {
    console.log('FileListComponent.ngOnInit');

    this.fileService.getAllFinishedFiles().subscribe(files => {
      console.log('FileListComponent.getFiles', files);
      this.files = files;
    });
  }
}