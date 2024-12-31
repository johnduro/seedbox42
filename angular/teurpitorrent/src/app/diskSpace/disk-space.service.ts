import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DiskSpace } from './disk-space';

/* interface DiskSpaceData {
  used: number;
  freePer: number;
  usedPer: number;
  total: string;
} */

interface DiskSpaceResponse {
  data: DiskSpace;
}


@Injectable({
  providedIn: 'root'
})
export class DiskSpaceService {

  private baseUrl = 'http://localhost:3000/dashboard/disk-space';

  constructor(private http: HttpClient) { }

  getDiskSpace(): Observable<DiskSpace> {
    return this.http.get<DiskSpaceResponse>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }
}
