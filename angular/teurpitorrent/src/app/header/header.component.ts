import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUserSecret, faCircleDot, faUser, faUsers, faFile, faScrewdriverWrench, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { ConnectedUsers, User } from '../users/user';
import { CommonModule } from '@angular/common';
import { SocketService } from '../socket/socket.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  authService = inject(AuthService);
  router = inject(Router);
  socketService = inject(SocketService);

  readonly ADMIN_ROLE = 'admin';
  user: User = {} as User;
  connectedUsers: ConnectedUsers = {} as ConnectedUsers;

  faUserSecret = faUserSecret;
  faCircleDot = faCircleDot;
  faUser = faUser;
  faUsers = faUsers;
  faFile = faFile;
  faScrewdriverWrench = faScrewdriverWrench;
  faRightFromBracket = faRightFromBracket;

  ngOnInit() {
    const user = this.authService.getConnectedUser();
    if (!user) {
      this.router.navigate(['/login']);
    }

    if (user) {
      this.user = user;
    }

    this.socketService.onEvent('connectedUsers', (msg) => {
      this.connectedUsers = msg as ConnectedUsers;
    });

    this.socketService.sendEvent('connectedUsers', {});
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Close other open dropdowns
    const openDropdowns = document.querySelectorAll('.dropdown.show');
    openDropdowns.forEach(dropdown => {
      if (event.target && dropdown !== (event.target as HTMLElement).closest('.dropdown')) {
        dropdown.classList.remove('show');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
          menu.classList.remove('show');
        }
      }
    });

    // Toggle the clicked dropdown
    const dropdown = (event.target as HTMLElement).closest('.dropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
      const menu = dropdown.querySelector('.dropdown-menu');
      if (menu) {
        menu.classList.toggle('show');
      }
    }
  }

  isActive(url: string): boolean {
    return this.router.url === url;
  }
}
