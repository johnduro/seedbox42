import { Component, Input, SimpleChanges } from '@angular/core';
import { FilesService } from '../files/files.service';
import { File } from '../files/file';
import { CommonModule } from '@angular/common';
import { FileListFileComponent } from '../file-list-file/file-list-file.component';
import { faUser, faHeart, faComments, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule, FileListFileComponent, FormsModule, FontAwesomeModule],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.scss'
})
export class FileListComponent {
  @Input({ required: true }) files!: File[];
  
  filteredFiles: File[] = [];
  research: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  classSort: string = '';
  
  faUser = faUser;
  faHeart = faHeart;
  faComments = faComments;
  faSearch = faSearch;
  
  constructor(private fileService: FilesService) { }

  ngOnInit(): void {
    this.filteredFiles = this.files;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['files']) {
      this.filteredFiles = this.files;
      this.filterFiles();
    }
  }

  orderBy(field: string): void {
    if (this.sortColumn === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = field;
      this.sortDirection = 'asc';
    }

    this.classSort = this.sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc';

    this.filteredFiles.sort((a, b) => {
      const aValue = this.getFieldValue(a, field);
      const bValue = this.getFieldValue(b, field);

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  getFieldValue(file: File, field: string): any {
    switch (field) {
      case 'creator.login':
        return file.creator.login;
      default:
        return (file as any)[field];
    }
  }

  updateFile(updatedFile: File): void {
    const index = this.files.findIndex(file => file._id === updatedFile._id);
    if (index !== -1) {
      this.files[index] = updatedFile;
      this.filterFiles();
    }
  }

  flattenObject(obj: any, prefix = ''): any {
    return Object.keys(obj).reduce((acc: { [key: string]: any }, k: string) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        Object.assign(acc, this.flattenObject(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  }

  filterFiles(): void {
    const searchTerm = this.research.toLowerCase();
    this.filteredFiles = this.files.filter(file => {
      const flatFile = this.flattenObject(file);
      return Object.values(flatFile).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm)
      );
    });
  }
}