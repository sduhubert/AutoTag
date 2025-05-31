import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { videoService } from '../pages/auto-tag/auto-tag.service';
import { Video } from '../models/videos';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  videos: Video[] = [];
  editingVideo: Video | null = null;
  editingTags: Video | null = null;
  editingSummary: Video | null = null;
  
  // For tag editing
  newTagName: string = '';
  
  constructor(private videoService: videoService) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.videoService.getVideos().subscribe(data => {
      this.videos = data;
    });
  }

  // Title editing functionality
  startEdit(video: Video): void {
    this.editingVideo = { ...video };
  }

  cancelEdit(): void {
    this.editingVideo = null;
  }

  saveVideoTitle(): void {
    if (this.editingVideo) {
      this.videoService.updateVideoTitle(this.editingVideo.videoid, this.editingVideo.title)
        .subscribe({
          next: () => {
            const index = this.videos.findIndex(v => v.videoid === this.editingVideo?.videoid);
            if (index !== -1) {
              this.videos[index].title = this.editingVideo?.title || '';
            }
            this.editingVideo = null;
          },
          error: (error) => {
            console.error('Error updating video title:', error);
          }
        });
    }
  }

  // Tag editing functionality
  startEditTags(video: Video): void {
    this.editingTags = { 
      ...video, 
      tags: [...video.tags] // Deep copy of tags array
    };
    this.newTagName = '';
  }

  cancelEditTags(): void {
    this.editingTags = null;
    this.newTagName = '';
  }

  addTag(): void {
    if (this.editingTags && this.newTagName.trim()) {
      // Check if tag already exists
      const tagExists = this.editingTags.tags.some(tag => 
        tag.name.toLowerCase() === this.newTagName.trim().toLowerCase()
      );
      
      if (!tagExists) {
        this.editingTags.tags.push({
          name: this.newTagName.trim(),
          VideoTag: null
        });
        this.newTagName = '';
      }
    }
  }

  removeTag(tagIndex: number): void {
    if (this.editingTags) {
      this.editingTags.tags.splice(tagIndex, 1);
    }
  }

  saveVideoTags(): void {
    if (this.editingTags) {
      const tagNames = this.editingTags.tags.map(tag => tag.name);
      this.videoService.updateVideoTags(this.editingTags.videoid, tagNames)
        .subscribe({
          next: () => {
            const index = this.videos.findIndex(v => v.videoid === this.editingTags?.videoid);
            if (index !== -1) {
              this.videos[index].tags = this.editingTags?.tags || [];
            }
            this.editingTags = null;
          },
          error: (error) => {
            console.error('Error updating video tags:', error);
          }
        });
    }
  }

  // Summary editing functionality
  startEditSummary(video: Video): void {
    this.editingSummary = { ...video };
  }

  cancelEditSummary(): void {
    this.editingSummary = null;
  }

  saveVideoSummary(): void {
    if (this.editingSummary) {
      this.videoService.updateVideoSummary(this.editingSummary.videoid, this.editingSummary.video_summary.summary)
        .subscribe({
          next: () => {
            const index = this.videos.findIndex(v => v.videoid === this.editingSummary?.videoid);
            if (index !== -1) {
              this.videos[index].video_summary.summary = this.editingSummary?.video_summary.summary || '';
            }
            this.editingSummary = null;
          },
          error: (error) => {
            console.error('Error updating video summary:', error);
          }
        });
    }
  }

  // Video validation functionality
  toggleVideoValidation(video: Video): void {
    const newStatus = video.validated ? false : true;
    
    this.videoService.updateVideoValidation(video.videoid, newStatus)
      .subscribe({
        next: () => {
          const index = this.videos.findIndex(v => v.videoid === video.videoid);
          if (index !== -1) {
            this.videos[index].validated = newStatus;
          }
        },
        error: (error) => {
          console.error('Error updating video validation:', error);
        }
      });
  }

  // Delete functionality
  deleteVideo(id: number): void {
    this.videoService.deleteVideo(id).subscribe({
      next: () => {
        this.videos = this.videos.filter(video => video.videoid !== id);
      },
      error: (error) => {
        console.error('Error deleting video:', error);
      }
    });
  }

  // Helper methods for display
  getTagsAsString(tags: any[]): string {
    return tags.map(tag => tag.name).join(', ');
  }

  getTruncatedSummary(summary: string, maxLength: number = 100): string {
    return summary.length > maxLength ? summary.substring(0, maxLength) + '...' : summary;
  }

  // Event handler methods for input fields
  updateVideoTitle(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (this.editingVideo && target) {
      this.editingVideo.title = target.value;
    }
  }

  updateNewTagName(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.newTagName = target.value;
    }
  }

  updateVideoSummaryText(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (this.editingSummary && target) {
      this.editingSummary.video_summary.summary = target.value;
    }
  }
}