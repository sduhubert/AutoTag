import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { videoModule } from '../auto-tag.module';
import { videoService } from '../auto-tag.service';
import { Video } from '../../../models/videos';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './video-list.component.html',
  styleUrl: './video-list.component.scss'
})
export class VideoListComponent implements OnInit{
  
  videos: Video[] = [];
  
  constructor (private videoService: videoService, private http: HttpClient){}

  ngOnInit(): void {
    this.videoService.getVideos().subscribe(data => {
      
      console.log( "directly loaded videos",data);
    
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
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.message = 'Please select a file first';
      this.isError = true;
      return;
    }

    // Check file type
    const fileType = this.selectedFile.type;
    if (!fileType.includes('video/')) {
      this.message = 'Please select a video file';
      this.isError = true;
      return;
    }

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
          
          // You could add logic here to refresh the videos list
          // or add the newly uploaded video to the list
        },
        error: (error) => {
          this.isUploading = false;
          this.message = 'Error uploading video: ' + (error.message || 'Unknown error');
          this.isError = true;
          console.error('Upload error:', error);
        }
      });
  }
}
