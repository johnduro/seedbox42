import { Component } from '@angular/core';
import { UserEditComponent } from '../user-edit/user-edit.component';
import { AuthService } from '../auth/auth.service';
import { FileListManagerComponent } from '../file-list-manager/file-list-manager.component';
import { File } from '../files/file';
import { FilesService } from '../files/files.service';

@Component({
  selector: 'app-my-profile-page',
  standalone: true,
  imports: [
    UserEditComponent,
    FileListManagerComponent
  ],
  templateUrl: './my-profile-page.component.html',
  styleUrl: './my-profile-page.component.scss'
})
export class MyProfilePageComponent {
  myUserId!: string
  files: File[] = [];

  constructor(
    private authService: AuthService,
    private filesService: FilesService
  ) { }


  ngOnInit(): void {
    // Fetch user data from the server
    const connectedUser = this.authService.getConnectedUser();
    if (connectedUser) {
      this.myUserId = connectedUser._id;
    }

    this.getFiles();
  }

  updateFiles(): void {
    this.getFiles();
  }

  private getFiles(): void {
        this.filesService.getUserLockedFiles().subscribe(files => {
      this.files = files;
    });
  }
}
