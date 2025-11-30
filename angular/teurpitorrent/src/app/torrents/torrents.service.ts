import { Injectable } from '@angular/core';
import { Torrent } from './torrent';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TorrentsService {

  private baseUrl: string = `${environment.backendHost}/torrent`;
  
  constructor(private httpClient: HttpClient) { }

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

  removeTorrent(ids: number[], removeLocalData: boolean): Observable<any> {
    const body = { ids: ids, removeLocalData: removeLocalData };
    return this.httpClient.delete<any>(`${this.baseUrl}/`, { body: body });
  }

  resumeTorrent(ids: number[]): Observable<any> {
    const body = { ids: ids };
    return this.httpClient.post<any>(`${this.baseUrl}/action/torrent-start`, body);
  }

  pauseTorrent(ids: number[]): Observable<any> {
    const body = { ids: ids };
    return this.httpClient.post<any>(`${this.baseUrl}/action/torrent-stop`, body);
  }

  verifyTorrentLocalData(ids: number[]): Observable<any> {
    const body = { ids: ids };
    return this.httpClient.post<any>(`${this.baseUrl}/action/torrent-verify`, body);
  }

  askTrackerForMorePeers(ids: number[]): Observable<any> {
    const body = { ids: ids };
    return this.httpClient.post<any>(`${this.baseUrl}/action/torrent-reannounce`, body);
  }

  moveTorrentUp(ids: number[]): Observable<any> {
    const body = { ids: ids };
    return this.httpClient.post<any>(`${this.baseUrl}/move/queue-move-up`, body);
  }

  moveTorrentDown(ids: number[]): Observable<any> {
    const body = { ids: ids };
    return this.httpClient.post<any>(`${this.baseUrl}/move/queue-move-down`, body);
  }

  moveTorrentToTop(ids: number[]): Observable<any> {
    const body = { ids: ids };
    return this.httpClient.post<any>(`${this.baseUrl}/move/queue-move-top`, body);
  }

  moveTorrentToBottom(ids: number[]): Observable<any> {
    const body = { ids: ids };
    return this.httpClient.post<any>(`${this.baseUrl}/move/queue-move-bottom`, body);
  }
}
