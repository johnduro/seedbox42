import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { SocketService } from '../socket/socket.service';
import { User } from '../users/user';
import { environment } from '../../environments/environment';

interface AuthResponse {
  token: string;
  data: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl: string = `${environment.backendHost}/authenticate`;

  constructor(private httpClient: HttpClient, private socket: SocketService) { }

  login(data: { login: string, password: string }) {
    return this.httpClient.post<AuthResponse>(this.baseUrl, data)
      .pipe(tap((response) => {
        const { token, data: userData } = response;
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(userData));
        this.socket.connect(token);
        document.cookie = `token=${token}; path=/; secure; samesite=strict`;
      }));
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    this.socket.disconnect();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  isLoggedIn() {
    return localStorage.getItem('authUser') !== null;
  }

  getConnectedUser(): User | null {
    const userData = localStorage.getItem('authUser');
    return userData ? JSON.parse(userData) as User : null;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
