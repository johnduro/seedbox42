import { Component, Input, SimpleChanges } from '@angular/core';
import { FileDirectory } from '../files/file';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-directory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-directory.component.html',
  styleUrl: './file-directory.component.scss'
})
export class FileDirectoryComponent {
  @Input({ required: true }) fileDirectory!: FileDirectory;

  currentDirectory: FileDirectory = {} as FileDirectory;
  path: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileDirectory']) {
      this.currentDirectory = this.fileDirectory;
      this.path.push(this.currentDirectory.name);
    }
  }

  navigateToDirectory(event: Event, child: FileDirectory): void {
    event.preventDefault(); //check if needed when not using <a>
    this.path.push(child.name);
    this.currentDirectory = child;
  }

  navigateToPath(event: Event, index: number, segment: string): void {
    event.preventDefault();
    this.path = this.path.slice(0, index + 1);
    this.currentDirectory = this.findDirectoryByPath(this.fileDirectory, this.path.slice(1));
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
