import { Component } from '@angular/core';
import { UserEditComponent } from '../user-edit/user-edit.component';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-my-profile-page',
  standalone: true,
  imports: [
    UserEditComponent
  ],
  templateUrl: './my-profile-page.component.html',
  styleUrl: './my-profile-page.component.scss'
})
export class MyProfilePageComponent {
  myUserId!: string

  constructor(private authService: AuthService) { }


  ngOnInit(): void {
    // Fetch user data from the server
    const connectedUser = this.authService.getConnectedUser();
    if (connectedUser) {
      this.myUserId = connectedUser._id;
    }
  }
}
