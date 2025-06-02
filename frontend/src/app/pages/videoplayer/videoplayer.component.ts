import { Component, OnInit } from '@angular/core';
import { VgApiService, VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { VideoService } from '../../services/video.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Video } from '../../models/videos';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-videoplayer',
  standalone: true,
  imports: [
    CommonModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,

  ],
  templateUrl: './videoplayer.component.html',
  styleUrl: './videoplayer.component.css'
})
export class VideoplayerComponent implements OnInit {
  constructor(
      private videoService: VideoService,
      private http : HttpClient
    , private route: ActivatedRoute
  ) { }

  preload: string = 'auto';
  api: VgApiService = new VgApiService;
  currentVideoId: number = 0;
  CurrentVideo: Video = {
    videoid : 0,
    userid: 0,
    title: '',
    description: '',
    duration: '',     
    filepath: '',
    tags: [],
    video_summary: { summary: '' },
    thumbnail: '',
    validated: false
  };
  // CHANGED: added this method
  ngOnInit() {
    this.currentVideoId = this.getId();
    if (this.currentVideoId) {
      this.LoadVideoById(this.currentVideoId);
    }
  }

  // ADD this method:
getId(): number {
  return parseInt(this.route.snapshot.params['id'], 10);
}

  // Autoplay on page load - SIMPLIFIED (removed duplicate logic)
  onPlayerReady(api: VgApiService) {
    this.api = api;
    console.log("current id ", this.currentVideoId);
    console.log("current video ", this.CurrentVideo);
    console.log('onPlayerReady');
    this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(
      this.autoplay.bind(this)
    );
  }

    //Play video
  autoplay() {
    console.log('play');
    this.api.play();
  }

// FIX the LoadVideoById method:
LoadVideoById(id: number) {
  return this.videoService.getVideoById(id).subscribe({
    next: (data) => {
      this.CurrentVideo = data;
      console.log(this.CurrentVideo);
    },
    error: (error) => {
      console.error('Error loading video:', error);
    }
  });

  
}
}
