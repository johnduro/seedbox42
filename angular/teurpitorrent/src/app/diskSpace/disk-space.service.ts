import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DiskSpace } from './disk-space';
import { environment } from '../../environments/environment';

interface DiskSpaceResponse {
  data: DiskSpace;
}


@Injectable({
  providedIn: 'root'
})
export class DiskSpaceService {

  private baseUrl: string = `${environment.backendHost}/dashboard/disk-space`;

  constructor(private http: HttpClient) { }

  getDiskSpace(): Observable<DiskSpace> {
    return this.http.get<DiskSpaceResponse>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }
}
