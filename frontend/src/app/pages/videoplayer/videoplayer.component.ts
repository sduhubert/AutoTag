import { Component } from '@angular/core';
import { VgApiService, VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { videoService } from '../auto-tag/auto-tag.service';
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
export class VideoplayerComponent {

  constructor(
      private autoTagService: videoService,
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
    // duration: 0,
    filepath: '',
    tags: [],
    video_summary: { summary: '' },
    thumbnail: '',
  };

  //Autoplay on page load
  onPlayerReady(api: VgApiService) {
    this.api = api;
    this.currentVideoId = this.getId(this.currentVideoId);
    this.LoadVideoById(this.currentVideoId);
    console.log("current id ", this.currentVideoId);
    console.log("current video ", this.CurrentVideo);
    console.log('onPlayerReady');
    this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(
      this.autoplay.bind(this)
    )
  }

  //Play video
  autoplay() {
    console.log('play');
    this.api.play();
  }

  //Get id from the url
  getId(id: number) {
   return this.route.snapshot.params['id'];
  }

  LoadVideoById(id: number) {
    return this.autoTagService.getVideoById(id).subscribe(data => {
      this.CurrentVideo = data;
      console.log(this.CurrentVideo);
    })
  }

}
