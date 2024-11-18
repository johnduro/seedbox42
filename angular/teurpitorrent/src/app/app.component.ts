import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { SocketService } from './socket/socket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'teurpitorrent';

  constructor(private authService: AuthService, private socketService: SocketService) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      let token = this.authService.getToken();
      if (token) {
        this.socketService.connect(token);
      } else {
        console.error('Token is null');
      }
    }
  }
}
