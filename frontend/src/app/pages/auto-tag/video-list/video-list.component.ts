import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { videoModule } from '../auto-tag.module';
import { videoService } from '../auto-tag.service';
import { Video } from '../../../models/videos';
import { NgFor } from '@angular/common';
@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [NgFor],
  templateUrl: './video-list.component.html',
  styleUrl: './video-list.component.scss'
})
export class VideoListComponent implements OnInit{
  
  videos: Video[] = [];
  
  constructor (private videoService: videoService){}

  ngOnInit(): void {
    this.videoService.getVideos().subscribe(data => {
      this.videos = data;
    })
  }
}
