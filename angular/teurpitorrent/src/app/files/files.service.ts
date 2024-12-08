import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { File } from './file';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  private baseUrl = 'http://localhost:3000/file';
  private httpClient = inject(HttpClient);

  constructor() { }

  getAllFinishedFiles(): Observable<File[]> {
    return this.httpClient.get<{ data: File[] }>(`${this.baseUrl}/finished`)
    .pipe(map(response => response.data));
  }
}
