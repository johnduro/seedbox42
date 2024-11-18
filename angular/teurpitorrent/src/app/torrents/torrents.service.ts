import { inject, Injectable } from '@angular/core';
import { Torrent } from './torrent';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TorrentsService {

  private baseUrl = 'http://localhost:3000/torrent';
  private httpClient = inject(HttpClient);

  constructor() { }

  getAllTorrents(): Observable<Torrent[]> {
    return this.httpClient.get<{ data: { torrents: Torrent[] } }>(`${this.baseUrl}/get-all-torrents`)
    .pipe(map(response => response.data.torrents));
  }

  addTorrentWithUrl(url: string): Observable<any> {
    const body = { url: url };
    return this.httpClient.post<any>(`${this.baseUrl}/add-url`, body);
  }

  addTorrentWithFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('torrent', file);

    return this.httpClient.post<any>(`${this.baseUrl}/add-torrents`, formData);
  }
}
