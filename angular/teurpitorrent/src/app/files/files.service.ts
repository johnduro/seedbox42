import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { File, FileDetail, FileDirectory } from './file';

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

  getFileDetail(id: string): Observable<FileDetail> {
    return this.httpClient.get<{ data: FileDirectory, file: File }>(`${this.baseUrl}/detail/${id}`)
    .pipe(map(response => ({
      fileDirectory: response.data,
      file: response.file
    })));
  }
}
