import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Video } from '../models/videos';

export interface VideoSearchResponse {
  videos: Video[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchTerm: string;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private apiUrl = 'http://localhost:3000/api/video';

  constructor(private http: HttpClient) { }

  // Get all videos
  getVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(this.apiUrl);
  }

  // Get video by ID (compatible with existing videoplayer)
  getVideoById(id: number): Observable<Video> {
    return this.http.get<{ video: Video }>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response: { video: Video }) => response.video)
      );
  }

  // Search videos
  searchVideos(query: string, page: number = 1, limit: number = 20): Observable<VideoSearchResponse> {
    let params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<VideoSearchResponse>(`${this.apiUrl}/search`, { params });
  }

  // Upload video
  uploadVideo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // Delete video
  deleteVideo(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Update video title
  updateVideo(id: number, title: string): Observable<{ message: string; video: Video }> {
    return this.http.put<{ message: string; video: Video }>(`${this.apiUrl}/${id}`, { title });
  }

  // Update video tags
  updateVideoTags(id: number, tags: string[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/tags`, { tags });
  }

  // Update video summary
  updateVideoSummary(id: number, summary: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/summary`, { summary });
  }

  // Update video validation
  updateVideoValidation(id: number, validated: boolean): Observable<{ message: string; validated: boolean }> {
    return this.http.put<{ message: string; validated: boolean }>(`${this.apiUrl}/${id}/validation`, { validated });
  }
}