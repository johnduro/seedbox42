import { Component, inject } from '@angular/core';
import { FilesService } from '../files/files.service';
import { FileDetail, FileDetailAndDirectory, FileDirectory } from '../files/file';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FileDirectoryComponent } from '../file-directory/file-directory.component';
import { faHeart, faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { User } from '../users/user';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { FileDisplayRatingComponent } from '../file-display-rating/file-display-rating.component';

@Component({
  selector: 'app-file-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, FontAwesomeModule, FileDirectoryComponent, FileDisplayRatingComponent],
  templateUrl: './file-detail.component.html',
  styleUrl: './file-detail.component.scss'
})
export class FileDetailComponent {
  readonly ADMIN_ROLE = 'admin';

  private route = inject(ActivatedRoute);

  id: string = "";
  fileDetailAndDirectory: FileDetailAndDirectory = {} as FileDetailAndDirectory;
  fileDetail: FileDetail = {} as FileDetail;
  fileDirectory: FileDirectory = {} as FileDirectory;
  user: User = {} as User;
  newComment: string = '';
  hoverStars: any[] = [];
  userGrade: number = 0;

  faStar = faStar;
  faStarRegular = faStarRegular;
  faHeart = faHeart;

  constructor(private filesService: FilesService, private authService: AuthService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });

    this.filesService.getFileDetailAndDirectory(this.id).subscribe(fileDetail => {
      this.fileDetail = fileDetail.file;
      this.fileDirectory = fileDetail.fileDirectory;
      this.userGrade = this.getGradeByUser(this.user._id);
    });

    const connectedUser = this.authService.getConnectedUser();
    if (connectedUser) {
      this.user = connectedUser;
    }

    this.hoverStars = this.getStarIcons(0);
  }

  unlockFile(file: FileDetail) {
    this.filesService.unlockFile(this.id).subscribe(() => {
      this.filesService.getFileDetailAndDirectory(this.id).subscribe((updatedFile: FileDetailAndDirectory) => {
        this.fileDetail = updatedFile.file;
      });
    });
  }

  lockFile(file: FileDetail) {
    this.filesService.lockFile(this.id).subscribe(() => {
      this.filesService.getFileDetailAndDirectory(this.id).subscribe((updatedFile: FileDetailAndDirectory) => {
        this.fileDetail = updatedFile.file;
      });
    });
  }

  onUserAvatarImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/avatar/default.png';
  }

  getGradeByUser(userId: string): number {
    return this.fileDetail.grades.find(grade => grade.user._id === userId)?.grade || 0;
  }

  addComment(): void {
    this.filesService.addComment(this.id, this.newComment).subscribe((updatedFile: FileDetail) => {
      this.fileDetail = updatedFile;
      this.newComment = '';
    });
  }

  deleteComment(commentId: string): void {
    this.filesService.deleteComment(this.id, commentId).subscribe(() => {
      this.filesService.getFileDetailAndDirectory(this.id).subscribe((updatedFile: FileDetailAndDirectory) => {
        this.fileDetail = updatedFile.file;
      });
    });
  }

  getStarIcons(averageGrade: number): any[] {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < averageGrade) {
        stars.push(this.faStar);
      } else {
        stars.push(this.faStarRegular);
      }
    }
    return stars;
  }

  onStarHover(grade: number): void {
    this.hoverStars = this.getStarIcons(grade);
  }

  onStarClick(grade: number): void {
    this.filesService.gradeFile(this.id, grade).subscribe(() => {
      this.filesService.getFileDetailAndDirectory(this.id).subscribe((updatedFile: FileDetailAndDirectory) => {
        this.fileDetail = updatedFile.file;
        this.userGrade = grade;
        this.hoverStars = this.getStarIcons(grade);
      });
    });
  }
}
