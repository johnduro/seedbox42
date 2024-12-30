import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { File } from '../files/file';
import { FileTypeComponent } from '../file-type/file-type.component';
import { faUser, faHeart, faSearch, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FilesService } from '../files/files.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-file-list-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    FileTypeComponent
  ],
  templateUrl: './file-list-manager.component.html',
  styleUrl: './file-list-manager.component.scss'
})
export class FileListManagerComponent {
  @Input({ required: true }) files!: File[];
  @Input({ required: true }) isProfileMode!: boolean;
  @Input({ required: true }) updateFiles!: () => void;

  selectedFiles: File[] = [];
  filteredFiles: File[] = [];

  search: string = '';
  isCheckboxAllSelected: boolean = false;
  isUserAdmin: boolean = false;
  sortColumn: string = 'name';
  classSort: string = 'asc';

  faUser = faUser;
  faHeart = faHeart;
  faSearch = faSearch;
  faCheck = faCheck;

  constructor(
    private filesService: FilesService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.filteredFiles = this.files;
    this.isUserAdmin = this.authService.getConnectedUser()?.role === 'admin';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['files']) {
      this.updateFilteredFiles();
      console.log('Filtered files on changes', this.filteredFiles);
    }
  }

  filterFiles(): void {
    this.updateFilteredFiles();
  }

  updateFilteredFiles(): void {
    this.filteredFiles = this.files
      .filter(file => this.doesFileMatchSearch(file));
  }

  unlockForUser(): void {
    this.filesService.unlockFiles(this.selectedFiles.map(file => file._id)).subscribe(() => {
      this.updateFiles();
    });
  }

  hardUnlockSelected(): void {
    this.filesService.hardRemoveAllLocks(this.selectedFiles.map(file => file._id)).subscribe(() => {
      this.updateFiles();
    });
  }

  deleteSelected(): void {
    this.filesService.deleteFromDatabaseAndServer(this.selectedFiles.map(file => file._id)).subscribe(() => {
      this.updateFiles();
    });
  }

  deleteSelectedOnlyDb(): void {
    this.filesService.deleteFromDatabase(this.selectedFiles.map(file => file._id)).subscribe(() => {
      this.updateFiles();
    });
  }

  selectAllFiles(): void {
    this.filteredFiles.forEach(file => file.isSelected = this.isCheckboxAllSelected);
    this.updateSelectedFiles();
  }


  order(field: string): void {
    console.log(`Order files by ${field}`);
  }

  checkboxSwitch(): void {
    this.updateSelectedFiles();
  }

  openFile(file: File): void {
    console.log(`Open file`);
  }

  convertSize(size: number): string {
    return this.filesService.convertSize(size);
  }

  unlockFile(file: File): void {
    this.filesService.unlockFile(file._id).subscribe(() => {
      this.updateFiles();
    });
  }

  lockFile(file: File): void {
    this.filesService.lockFile(file._id).subscribe(() => {
      this.updateFiles();
    });
  }

  onUserAvatarImageError(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/avatar/default.png';
  }

  private updateSelectedFiles(): void {
    this.selectedFiles = this.files.filter(file => file.isSelected);
  }

  private doesFileMatchSearch(file: File): boolean {
    return file.name.toLowerCase().includes(this.search.toLowerCase());
  }
}
