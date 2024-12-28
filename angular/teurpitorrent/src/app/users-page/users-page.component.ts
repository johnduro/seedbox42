import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { User } from '../users/user';
import { UsersService } from '../users/users.service';
import { faPlusCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss'
})
export class UsersPageComponent {
  @ViewChild('deleteModal') deleteModal!: ElementRef;

  users: User[] = [];
  userToDelete: User | null = null;


  faPlusCircle = faPlusCircle;
  faTimes = faTimes;

  constructor(private router: Router, private usersService: UsersService) {
  }

  ngOnInit(): void {
    this.usersService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  navigateToNewUser(): void {
    this.router.navigate(['users/create']);
  }

  onUserAvatarImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/avatar/default.png';
  }

  navigateToEditUser(user: User): void {
    this.router.navigate(['users', user._id]);
  }

  openDeleteModal(user: User): void {
    this.userToDelete = user;

    const modalElement = this.deleteModal.nativeElement;
    modalElement.style.display = 'block';
    modalElement.classList.add('show');
    modalElement.setAttribute('aria-modal', 'true');
    modalElement.setAttribute('role', 'dialog');
  }

  closeModal(): void {
    const modalElement = this.deleteModal.nativeElement;
    modalElement.style.display = 'none';
    modalElement.classList.remove('show');
    modalElement.removeAttribute('aria-modal');
    modalElement.removeAttribute('role');
  }

  confirmDelete(): void {
    if (this.userToDelete) {
      this.usersService.deleteUser(this.userToDelete._id).subscribe(() => {
        this.users = this.users.filter(u => u._id !== this.userToDelete!._id);
        this.userToDelete = null;
        this.closeModal();
      });
    }
  }
}
