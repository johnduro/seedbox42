import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User, UserUpdate } from '../users/user';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss'
})
export class UserEditComponent {
  @Input() userId?: string;

  editedUser: UserUpdate = {} as UserUpdate;
  myFile: File | null = null;
  displayAdminCheckbox: boolean = true;
  isEditMode: boolean = true;
  passwordError: string | null = null;

  constructor(private usersService: UsersService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (this.userId) {
      this.usersService.getUser(this.userId).subscribe(async user => {
        this.editedUser = user;
        const connectedUser = await this.authService.getConnectedUser();
        if (connectedUser) {
          this.displayAdminCheckbox = connectedUser.role === 'admin' && connectedUser._id !== this.userId;
        }
      });
    } else {
      this.isEditMode = false;
      this.displayAdminCheckbox = true;
    }
  }

  saveUser(): void {
    if (this.editedUser.password && this.editedUser.password.length > 0 && this.editedUser.password.length < 5) {
      this.passwordError = 'Password must be at least 5 characters long';
      console.error('Password must be at least 5 characters long');
      return;
    } else {
      this.passwordError = null;
    }

    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  updateUser(): void {
    // Handle form submission logic here
    if (this.userId) {
      this.usersService.updateUser(this.userId, this.editedUser, this.myFile || undefined).subscribe({
      next: (response) => {
      },
      error: (error) => {
        console.error('Error updating user:', error);
      }
    });
  }
}

  createUser(): void {
    // Handle form submission logic here
    console.log('User created:', this.editedUser);
    this.usersService.createUser(this.editedUser, this.myFile || undefined).subscribe({
      next: (response) => {
        this.router.navigate(['users']);
      },
      error: (error) => {
        console.error('Error creating user:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.myFile = file;
    }
  }

  onUserAvatarImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/avatar/default.png';
  }
}
