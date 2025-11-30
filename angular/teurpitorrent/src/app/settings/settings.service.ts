import { Injectable } from '@angular/core';
import { Settings } from './settings';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl: string = `${environment.backendHost}/admin`;

  constructor(private httpClient: HttpClient) { }

  getSettings(): Observable<{ data: Settings, version: string }> {
    const url = `${this.baseUrl}/settings`;
    return this.httpClient.get<{ data: Settings, version: string }>(url)
      .pipe(map(response => response));
  }
}
