import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { SocketService } from '../socket/socket.service';
import { User } from '../users/user';

interface AuthResponse {
  token: string;
  data: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl = 'http://localhost:3000/authenticate'; //todo change this
  httpClient = inject(HttpClient);
  socket = inject(SocketService);

  constructor() { }

  login(data: { login: string, password: string }) {
    return this.httpClient.post<AuthResponse>(this.baseUrl, data)
      .pipe(tap((response) => {
        const { token, data: userData } = response;
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(userData));
        this.socket.connect(token);
      }));
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    this.socket.disconnect();
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
