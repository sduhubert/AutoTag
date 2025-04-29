import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Video } from '../../models/videos';
import { Visitor } from '@angular/compiler';
@Injectable({
  providedIn: 'root'
})
export class videoService {
  //Api Url to the backend 
  private apiUrl = "http://localhost:3000/api/video";

  constructor(private http: HttpClient) { }
  
  //Method to get videos from the backend api
  getVideos(): Observable<Video[]>{
    return this.http.get<{ videos: Video[] }>(this.apiUrl).pipe(
      map(response => response.videos)
    );
  }

  getVideoById(id: number): Observable<Video> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<{video: Video}>(url).pipe(
      map(response => response.video)
    );
  }
}
