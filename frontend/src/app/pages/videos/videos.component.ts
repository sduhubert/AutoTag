import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { VideoService } from '../../services/video.service';
import { Video } from '../../models/videos';

interface VideoSearchResponse {
  videos: Video[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchTerm: string;
}

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss']
})
export class VideosComponent implements OnInit, OnDestroy {
  // Videos data
  videos: Video[] = [];
  allVideos: Video[] = [];
  isLoadingVideos = false;
  
  // Search functionality
  searchQuery: string = '';
  isSearching = false;
  hasSearched = false;
  totalResults: number = 0;
  private searchSubject = new Subject<string>();
  private subscription: Subscription = new Subscription();

  // Upload functionality (keep existing functionality)
  selectedFile: File | null = null;
  isUploading = false;
  message = '';
  isError = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private videoService: VideoService
  ) {}

  ngOnInit() {
    this.loadVideos();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Load all videos from backend
  loadVideos(): void {
    this.isLoadingVideos = true;
    this.videoService.getVideos().subscribe({
      next: (videos) => {
        this.videos = videos;
        this.allVideos = videos;
        this.isLoadingVideos = false;
      },
      error: (error) => {
        console.error('Error loading videos:', error);
        this.isLoadingVideos = false;
        this.loadFallbackVideos();
      }
    });
  }

  // Fallback videos if backend fails
  loadFallbackVideos(): void {
    this.videos = [
      {
        videoid: 1,
        userid: 1,
        title: 'Getting Started with Auto Tag',
        filepath: '/app/uploads_shared/example1.mp4',
        duration: '5:24',        
        thumbnail: 'example1.png',
        validated: true,
        description: '',
        video_summary: { summary: 'Learn the basics of setting up Auto Tag for your organization.' },
        tags: [{ name: 'tutorial', VideoTag: null }]
      }
    ];
    this.allVideos = this.videos;
  }

  // Setup search with debounce
  setupSearch(): void {
    this.subscription.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          if (query.trim() === '') {
            this.clearSearch();
            return [];
          }
          
          this.isSearching = true;
          return this.videoService.searchVideos(query, 1, 50);
        })
      ).subscribe({
        next: (response: VideoSearchResponse) => {
          if (response.videos) {
            this.videos = response.videos;
            this.totalResults = response.totalCount;
            this.hasSearched = true;
          }
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Error searching videos:', error);
          this.isSearching = false;
          this.videos = [];
        }
      })
    );
  }

  // Handle search input
  onSearchInput(event: any): void {
    const query = event.target.value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  // Clear search
  clearSearch(): void {
    this.searchQuery = '';
    this.videos = this.allVideos;
    this.hasSearched = false;
    this.totalResults = 0;
    this.isSearching = false;
  }

  // Upload functionality (keep existing logic)
  onFileSelected(event: any): void {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.message = `File selected: ${this.selectedFile.name}`;
      this.isError = false;
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.message = 'Please select a file first';
      this.isError = true;
      return;
    }

    const fileType = this.selectedFile.type;
    if (!fileType.includes('video/')) {
      this.message = 'Please select a video file';
      this.isError = true;
      return;
    }

    this.isUploading = true;
    this.message = '';

    this.videoService.uploadVideo(this.selectedFile).subscribe({
      next: (response: any) => {
        this.isUploading = false;
        this.message = 'Video uploaded successfully!';
        this.isError = false;
        this.selectedFile = null;

        // Reset file input
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        // Reload videos to include the new one
        this.loadVideos();
      },
      error: (error) => {
        this.isUploading = false;
        this.message = 'Error uploading video: ' + (error.message || 'Unknown error');
        this.isError = true;
        console.error('Upload error:', error);
      }
    });
  }

  // Utility methods for template
  formatDuration(duration: string): string {
    return duration || '00:00:00';
  }

  getTagNames(video: Video): string {
    if (video.tags && video.tags.length > 0) {
      return video.tags.map(tag => tag.name).join(', ');
    }
    return 'No tags';
  }

  getDescription(video: Video): string {
    if (video.video_summary && video.video_summary.summary) {
      return video.video_summary.summary.length > 100 
        ? video.video_summary.summary.substring(0, 100) + '...'
        : video.video_summary.summary;
    }
    return 'No description available';
  }

  // Get thumbnail class for CSS styling (keep your existing color system)
  getThumbnailClass(video: Video): string {
    // Use video ID to determine thumbnail class consistently
    const classes = ['thumbnail-1', 'thumbnail-2', 'thumbnail-3', 'thumbnail-4', 'thumbnail-5', 'thumbnail-6'];
    return classes[video.videoid % classes.length];
  }

  // Navigate to videoplayer
  playVideo(video: Video): void {
    this.router.navigate(['/videoplayer', video.videoid]);
  }

  // View video (same as playVideo but more explicit)
  viewVideo(video: Video): void {
    this.router.navigate(['/videoplayer', video.videoid]);
  }
}