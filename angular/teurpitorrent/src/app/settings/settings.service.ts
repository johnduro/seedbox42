import { inject, Injectable } from '@angular/core';
import { Settings } from './settings';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl = 'http://localhost:3000/admin';
  private httpClient = inject(HttpClient);

  constructor() { }

  getSettings(): Observable<{ data: Settings, version: string }> {
    const url = `${this.baseUrl}/settings`;
    return this.httpClient.get<{ data: Settings, version: string }>(url)
      .pipe(map(response => response));
  }
}
