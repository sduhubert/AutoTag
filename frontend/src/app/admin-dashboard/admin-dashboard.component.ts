import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { videoService } from '../pages/auto-tag/auto-tag.service';
import { Video } from '../models/videos';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, MatIconModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  videos: Video[] = [];
  editingVideo: Video | null = null;
  
  constructor(private videoService: videoService) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.videoService.getVideos().subscribe(data => {
      this.videos = data;
    });
  }

  startEdit(video: Video): void {
    // Create a copy of the video to edit
    this.editingVideo = { ...video };
  }

  cancelEdit(): void {
    this.editingVideo = null;
  }

  saveVideoTitle(): void {
    if (this.editingVideo) {
      // Update the video title in the backend
      this.videoService.updateVideoTitle(this.editingVideo.videoid, this.editingVideo.title)
        .subscribe({
          next: () => {
            // Update the video in the local array
            const index = this.videos.findIndex(v => v.videoid === this.editingVideo?.videoid);
            if (index !== -1) {
              this.videos[index].title = this.editingVideo?.title || '';
            }
            // Reset editing state
            this.editingVideo = null;
          },
          error: (error) => {
            console.error('Error updating video title:', error);
          }
        });
    }
  }

  deleteVideo(id: number): void {
    this.videoService.deleteVideo(id).subscribe({
      next: () => {
        // Remove the deleted video from the local array
        this.videos = this.videos.filter(video => video.videoid !== id);
      },
      error: (error) => {
        console.error('Error deleting video:', error);
      }
    });
  }
}