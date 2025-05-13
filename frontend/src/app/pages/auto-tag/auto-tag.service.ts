import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
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
  getVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(this.apiUrl).pipe(
      map(videos => 
        videos.map(video => {
          // Ensure we map tags properly and keep VideoTag object
          video.tags = video.tags.map(tag => ({
            name: tag.name,           // Extract the name
            VideoTag: tag.VideoTag    // Keep the VideoTag object
          }));
          return video;
        })
      )
    );
  }

  getVideoById(id: number): Observable<Video> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<{video: Video}>(url).pipe(
      map(response => response.video)
    );
  }

  deleteVideo(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error('Delete failed', error);
        return throwError(() => new Error('Failed to delete video'));
      })
    );
  }
}
