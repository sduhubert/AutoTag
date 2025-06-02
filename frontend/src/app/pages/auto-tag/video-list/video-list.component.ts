import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { videoModule } from '../auto-tag.module';
import { videoService } from '../auto-tag.service';
import { Video } from '../../../models/videos';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, Subject, Subscription, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [NgFor, NgIf, MatIconModule, CommonModule, FormsModule],
  templateUrl: './video-list.component.html',
  styleUrl: './video-list.component.scss'
})
export class VideoListComponent implements OnInit{
  
  videos: Video[] = [];
  allVideos: Video[] = [];
  
  constructor (private videoService: videoService, private http: HttpClient){}

  ngOnInit(): void {
    this.loadVideosData();
    this.setupSearch();
  }

  // Search functionality
    searchQuery: string = '';
    isSearching = false;
    hasSearched = false;
    totalResults: number = 0;
    private searchSubject = new Subject<string>();
    private subscription: Subscription = new Subscription();

  ngOnDestroy(): void {
  this.subscription.unsubscribe();
}

  loadVideosData(){
    this.videoService.getVideos().subscribe(data => {
      
      console.log( "directly loaded videos",data);
      this.allVideos = data;
      this.videos = data;
      console.log( "videos in the videos list",this.videos);
    })
  }
  

  //Video redirection

  playVideo(videoId: number) {
    window.location.href = `/videoplayer/${videoId}`;
  }



  //Video Upload

  selectedFile: File | null = null;
  isUploading = false;
  message = '';
  isError = false;

  onFileSelected(event: any): void {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.message = `File selected: ${this.selectedFile.name}`;
      this.isError = false;
      console.log(this.selectedFile.name);
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.message = 'Please select a file first';
      this.isError = true;
      return;
    }

    // Check file type
    // const fileType = this.selectedFile.type;
    // if (!(fileType.includes('video/') && (fileType.includes('audio/')))) {
    //   this.message = 'Please select a video file';
    //   this.isError = true;
    //   return;
    // }

    this.isUploading = true;
    this.message = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // Replace with your actual API endpoint
    this.http.post('http://localhost:3000/api/video/upload', formData)
      .subscribe({
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
          
          this.loadVideosData();
          
        },
        error: (error) => {
          this.isUploading = false;
          this.message = 'Error uploading video: ' + (error.message || 'Unknown error');
          this.isError = true;
          console.error('Upload error:', error);
        }
      });
  }

  // Variable that is used for the loading circle in the UI
  deleteInProgress = false;

  deleteVideo(id: number): void {
    this.deleteInProgress = true;

    this.videoService.deleteVideo(id).subscribe({
      next: () => {
        // Reload the videos list
        this.videoService.getVideos().subscribe(data => {
          this.videos = data;
        })
      },
      error: (error) => {
        console.error('Error deleting video:', error);
      },
      complete: () => {
        this.deleteInProgress = false;
      }
    });
  }

  onSearchInput(event: any): void {
    const query = event.target.value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

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
        next: (response: any) => {
          if (response && response.videos) {
            this.videos = response.videos;
            this.totalResults = response.totalCount;
            this.hasSearched = true;
          }
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Error searching videos:', error);
          this.videos = [];
          this.isSearching = false;
        }
      })
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.videos = this.allVideos;
    this.hasSearched = false;
    this.totalResults = 0;
    this.isSearching = false;
  }
}
