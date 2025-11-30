import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { File, FileDetail, FileDetailAndDirectory, FileDirectory } from './file';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  private host: string = environment.backendHost;
  private baseUrl: string = `${this.host}/file`;

  constructor(private httpClient: HttpClient) { }

  getAllFinishedFiles(): Observable<File[]> {
    return this.httpClient.get<{ data: File[] }>(`${this.baseUrl}/finished`)
      .pipe(map(response => response.data));
  }

  getUserLockedFiles(): Observable<File[]> {
    const url = `${this.baseUrl}/user-locked`;
    return this.httpClient.get<{ data: File[] }>(url)
      .pipe(map(response => response.data));
  }

  getRecentFiles(): Observable<File[]> {
    return this.httpClient.get<{ data: File[] }>(`${this.host}/dashboard/recent-file`)
      .pipe(map(response => response.data));
  }

  getRecentUserFiles(): Observable<File[]> {
    return this.httpClient.get<{ data: File[] }>(`${this.host}/dashboard/recent-user-file`)
      .pipe(map(response => response.data));
  }

  getOldestUserLockedFiles(): Observable<File[]> {
    return this.httpClient.get<{ data: File[] }>(`${this.host}/dashboard/oldest-user-locked-file`)
      .pipe(map(response => response.data));
  }

  getOldestLockedFiles(): Observable<File[]> {
    return this.httpClient.get<{ data: File[] }>(`${this.host}/dashboard/oldest-locked-file`)
      .pipe(map(response => response.data));
  }

  getBestRaterFiles(): Observable<File[]> {
    return this.httpClient.get<{ data: File[] }>(`${this.host}/dashboard/best-rated-file`)
      .pipe(map(response => response.data));
  }

  getMostCommentedFiles(): Observable<File[]> {
    return this.httpClient.get<{ data: File[] }>(`${this.host}/dashboard/most-commented-file`)
      .pipe(map(response => response.data));
  }

  getMostDownloadedFiles(): Observable<File[]> {
    return this.httpClient.get<{ data: File[] }>(`${this.host}/dashboard/most-downloaded-file`)
      .pipe(map(response => response.data));
  }

  getFile(id: string): Observable<File> {
    return this.httpClient.get<File>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response));
  }

  getFileDetailAndDirectory(id: string): Observable<FileDetailAndDirectory> {
    return this.httpClient.get<{ data: FileDirectory, file: FileDetail }>(`${this.baseUrl}/detail/${id}`)
      .pipe(map(response => ({
        fileDirectory: response.data,
        file: response.file
      })));
  }

  getDownloadUrl(fileId: string, path: string, name: string): Observable<string> {
    const encodedPath = btoa(path);
    const encodedName = btoa(name);
    const url = `${this.baseUrl}/download-url/${fileId}/${encodedPath}/${encodedName}`;

    const headers = { 'Content-Type': 'application/json' };

    return this.httpClient.get<{ url: string }>(url)
      .pipe(map(response => `${this.host}${response.url}`));
  }

  unlockFile(fileId: string): Observable<File> {
    return this.httpClient.delete<{ data: File }>(`${this.baseUrl}/remove-lock/${fileId}`, {})
      .pipe(map(response => response.data));
  }

  unlockFiles(filesId: string[]): Observable<{ message: string }> {
    const url = `${this.baseUrl}/remove-all-user-lock`;
    const body = { toUnlock: filesId };
    return this.httpClient.put<{ message: string }>(url, body)
      .pipe(map(response => response));
  }

  lockFile(fileId: string): Observable<File> {
    return this.httpClient.post<{ data: File }>(`${this.baseUrl}/add-lock/${fileId}`, {})
      .pipe(map(response => response.data));
  }

  addComment(fileId: string, comment: string): Observable<FileDetail> {
    const url = `${this.baseUrl}/add-comment/${fileId}`;
    const body = { comment: comment };
    return this.httpClient.post<{ file: FileDetail }>(url, body)
      .pipe(map(response => response.file));
  }

  deleteComment(fileId: string, commentId: string): Observable<{ message: string }> {
    const url = `${this.baseUrl}/remove-comment/${fileId}`;
    const body = { commentId: commentId };
    return this.httpClient.delete<{ message: string }>(url, { body })
      .pipe(map(response => response));
  }

  gradeFile(fileId: string, grade: number): Observable<FileDetail> {
    const url = `${this.baseUrl}/add-grade/${fileId}`;
    const body = { grade: grade };
    return this.httpClient.post<{ file: FileDetail }>(url, body)
      .pipe(map(response => response.file));
  }

  convertSize(size: number): string {
    const size_K = 1000;
    const size_B_str = 'B';
    const size_K_str = 'kB';
    const size_M_str = 'MB';
    const size_G_str = 'GB';
    const size_T_str = 'TB';

    if (size < size_K) return `${size} ${size_B_str}`;

    let convertedSize: number;
    let unit: string;

    if (size < Math.pow(size_K, 2)) {
      convertedSize = size / size_K;
      unit = size_K_str;
    } else if (size < Math.pow(size_K, 3)) {
      convertedSize = size / Math.pow(size_K, 2);
      unit = size_M_str;
    } else if (size < Math.pow(size_K, 4)) {
      convertedSize = size / Math.pow(size_K, 3);
      unit = size_G_str;
    } else {
      convertedSize = size / Math.pow(size_K, 4);
      unit = size_T_str;
    }

    // try to have at least 3 digits and at least 1 decimal
    return convertedSize <= 9.995 ? `${convertedSize.toFixed(2)} ${unit}` : `${convertedSize.toFixed(1)} ${unit}`;
  }

  hardRemoveAllLocks(toUnlock: string[]): Observable<{ message: string }> {
    const url = `${this.baseUrl}/hard-remove-all-lock`;
    const body = { toUnlock };
    return this.httpClient.put<{ message: string }>(url, body)
      .pipe(map(response => response));
  }

  deleteFromDatabaseAndServer(filesId: string[]): Observable<{ message: string }> {
    const url = `${this.baseUrl}/delete-all`;
    const body = { toDelete: filesId };
    return this.httpClient.put<{ message: string }>(url, body)
      .pipe(map(response => response));
  }

  deleteFromDatabase(filesId: string[]): Observable<{ message: string }> {
    const url = `${this.baseUrl}/delete-all-from-db`;
    const body = { toDelete: filesId };
    return this.httpClient.put<{ message: string }>(url, body)
      .pipe(map(response => response));
  }
}
