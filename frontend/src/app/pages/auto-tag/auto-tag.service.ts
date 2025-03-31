import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Video } from '../../models/videos';
import { Visitor } from '@angular/compiler';
@Injectable({
  providedIn: 'root'
})
export class videoService {/*
  //Api Url to the backend 
  private apiUrl = "http://localhost:3003/videos";

  constructor(private http: HttpClient) { }
  
  //Method to get videos from the backend api
  getVideos(): Observable<Video[]>{
    return this.http.get<Video[]>(this.apiUrl);
  }*/
}
