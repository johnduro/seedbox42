import { Component } from '@angular/core';
import { FilesService } from '../files/files.service';
import { File } from '../files/file';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule],
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