import { Component, Input, SimpleChanges } from '@angular/core';
import { FileDetail, FileDirectory } from '../files/file';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FileTypeComponent } from '../file-type/file-type.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FilesService } from '../files/files.service';

@Component({
  selector: 'app-file-directory',
  standalone: true,
  imports: [CommonModule, RouterLink, FileTypeComponent, FontAwesomeModule],
  templateUrl: './file-directory.component.html',
  styleUrl: './file-directory.component.scss'
})
export class FileDirectoryComponent {
  @Input({ required: true }) fileDirectory!: FileDirectory;
  @Input({ required: true }) fileDetail!: FileDetail;

  currentDirectory: FileDirectory = {} as FileDirectory;
  path: string[] = [];

  faCircleArrowDown = faCircleArrowDown;

  constructor(private filesService: FilesService) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileDirectory']) {
      this.currentDirectory = this.fileDirectory;
      if (this.currentDirectory.name) {
        this.path.push(this.currentDirectory.name);
      }
    }
  }

  navigateToDirectory(child: FileDirectory): void {
    this.path.push(child.name);
    this.currentDirectory = child;
  }

  navigateToPath(event: Event, index: number, segment: string): void {
    event.preventDefault();
    this.path = this.path.slice(0, index + 1);
    this.currentDirectory = this.findDirectoryByPath(this.fileDirectory, this.path.slice(1));
  }

  downloadFile(name: string) {
    let fileName = name;
    if (!fileName) {
      fileName = this.currentDirectory.name;
    }
    const path = this.filesService.getDownloadUrl(this.fileDetail._id, this.getDownloadPath(name), fileName);
    window.location.href = path;
  }

  convertSize(size: number): string {
    return this.filesService.convertSize(size);
  }

  private getDownloadPath(fileName: string): string {
    const baseNameTrimmed = this.path.slice(1);
    const basePath = baseNameTrimmed.join('/');
    return baseNameTrimmed.length > 0 ? `/${basePath}/${fileName}` : `/${fileName}`;
  }

  private findDirectoryByPath(directory: FileDirectory, path: string[]): FileDirectory {
    if (path.length === 0) {
      return directory;
    }
    const nextSegment = path[0];
    const nextDirectory = directory.children?.find(child => child.name === nextSegment && child.isDirectory);
    if (!nextDirectory) {
      throw new Error(`Directory not found: ${nextSegment}`);
    }
    return this.findDirectoryByPath(nextDirectory, path.slice(1));
  }
}
