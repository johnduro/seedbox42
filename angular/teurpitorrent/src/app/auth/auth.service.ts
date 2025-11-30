import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
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
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private httpClient: HttpClient, private socket: SocketService) {
    const userData = localStorage.getItem('authUser');
    const user = userData ? JSON.parse(userData) as User : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(data: { login: string, password: string }) {
    return this.httpClient.post<AuthResponse>(this.baseUrl, data)
      .pipe(tap((response) => {
        const { token, data: userData } = response;
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(userData));
        this.currentUserSubject.next(userData);
        this.socket.connect(token);
      }));
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    this.currentUserSubject.next(null);
    this.socket.disconnect();
  }

  isLoggedIn() {
    return localStorage.getItem('authUser') !== null;
  }

  getConnectedUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateConnectedUser(user: User) {
    localStorage.setItem('authUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
