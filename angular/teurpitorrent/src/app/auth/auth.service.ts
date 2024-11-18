import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { SocketService } from '../socket/socket.service';

interface AuthResponse {
  token: string;
  data: {
    _id: string;
    login: string;
    password: string;
    mail: string;
    avatar: string;
    role: string;
    createdAt: string;
    __v: number;
  };
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

  getUserData(): any {
    const userData = localStorage.getItem('authUser');
    return userData ? JSON.parse(userData) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
