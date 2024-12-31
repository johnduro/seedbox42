import { Component, Inject, Input, SimpleChanges } from '@angular/core';
import { Panel } from '../settings/settings';
import { CommonModule } from '@angular/common';
import { File } from '../files/file';
import { FileTypeComponent } from '../file-type/file-type.component';
import { FilesService } from '../files/files.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-file-list',
  standalone: true,
  imports: [
    CommonModule,
    FileTypeComponent
  ],
  templateUrl: './dashboard-file-list.component.html',
  styleUrl: './dashboard-file-list.component.scss'
})
export class DashboardFileListComponent {
  files: File[] = [];

  constructor(
    @Inject('panel') public panel: Panel,
    private router: Router,
    private filesService: FilesService
  ) { }

  ngOnInit(): void {
    this.loadFiles();
  }

  private loadFiles(): void {
    if (!this.panel) {
      return;
    }

    switch (this.panel.name) {
      case 'recent-file':
        this.filesService.getRecentFiles().subscribe(files => this.files = files);
        break;
      case 'recent-user-file':
        this.filesService.getRecentUserFiles().subscribe(files => this.files = files);
        break;
      case 'oldest-user-locked-file':
        this.filesService.getOldestUserLockedFiles().subscribe(files => this.files = files);
        break;
      case 'oldest-locked-file':
        this.filesService.getOldestLockedFiles().subscribe(files => this.files = files);
        break;
      case 'best-rated-file':
        this.filesService.getBestRaterFiles().subscribe(files => this.files = files);
        break;
      case 'most-commented-file':
        this.filesService.getMostCommentedFiles().subscribe(files => this.files = files);
        break;
      case 'most-downloaded-file':
        this.filesService.getMostDownloadedFiles().subscribe(files => this.files = files);
        break;
    }
  }

  openFile(file: File) {
    this.router.navigate(['files', file._id]);
  }

  convertSize(size: number): string {
    return this.filesService.convertSize(size);  
  }
}
