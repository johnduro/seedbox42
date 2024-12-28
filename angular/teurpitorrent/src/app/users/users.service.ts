import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User, UserUpdate } from './user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl = 'http://localhost:3000/users';
  private httpClient = inject(HttpClient);

  constructor() { }

  getUser(userId: string): Observable<User> {
    const url = `${this.baseUrl}/${userId}`;
    return this.httpClient.get<User>(url)
      .pipe(map(response => response));
  }

  getUsers(): Observable<User[]> {
    const url = `${this.baseUrl}/`;
    return this.httpClient.get<User[]>(url)
      .pipe(map(response => response));
  }

  updateUser(userId: string, userUpdate: UserUpdate, file?: File): Observable<User> {
    const url = `${this.baseUrl}/${userId}`;
    const formData = new FormData();

    // Append user data to FormData
    formData.append('login', userUpdate.login);
    formData.append('mail', userUpdate.mail);
    formData.append('role', userUpdate.role);
    formData.append('avatar', userUpdate.avatar || '');

    // Append password if it is not empty
    if (userUpdate.password) {
      formData.append('password', userUpdate.password);
    }

    // Append file if it exists
    if (file) {
      formData.append('avatar', file, file.name);
    }

    return this.httpClient.put<User>(url, formData)
      .pipe(map(response => response));
  }

  createUser(userUpdate: UserUpdate, file?: File): Observable<any> {
    const url = `${this.baseUrl}/`;
    const formData = new FormData();

    // Append user data to FormData
    formData.append('login', userUpdate.login);
    formData.append('mail', userUpdate.mail);
    formData.append('role', userUpdate.role);
    formData.append('avatar', userUpdate.avatar || '');

    // Append password if it is not empty
    if (userUpdate.password) {
      formData.append('password', userUpdate.password);
    }

    // Append file if it exists
    if (file) {
      formData.append('avatar', file, file.name);
    }

    return this.httpClient.post<any>(url, formData)
      .pipe(map(response => response));
  }

  deleteUser(userId: string): Observable<any> {
    const url = `${this.baseUrl}/${userId}`;
    return this.httpClient.delete<any>(url)
      .pipe(map(response => response));
  }
}
