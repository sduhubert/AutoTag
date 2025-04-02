import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Video {
  id: number;
  title: string;
  description: string;
  duration: string;
  thumbnailClass: string;
}

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss']
})
export class VideosComponent {
  videos: Video[] = [
    {
      id: 1,
      title: 'Getting Started with Auto Tag',
      description: 'Learn the basics of setting up Auto Tag for your organization.',
      duration: '5:24',
      thumbnailClass: 'thumbnail-1'
    },
    {
      id: 2,
      title: 'Advanced Tagging Strategies',
      description: 'Discover powerful techniques to maximize your tagging efficiency.',
      duration: '8:12',
      thumbnailClass: 'thumbnail-2'
    },
    {
      id: 3,
      title: 'Batch Processing Tutorial',
      description: 'How to process thousands of items simultaneously with Auto Tag.',
      duration: '6:45',
      thumbnailClass: 'thumbnail-3'
    },
    {
      id: 4,
      title: 'Custom Rules and Workflows',
      description: 'Create tailored automation rules specific to your business needs.',
      duration: '10:18',
      thumbnailClass: 'thumbnail-4'
    },
    {
      id: 5,
      title: 'Integration with External Systems',
      description: 'Connect Auto Tag with your existing tech stack for seamless workflows.',
      duration: '7:33',
      thumbnailClass: 'thumbnail-5'
    },
    {
      id: 6,
      title: 'Reporting and Analytics',
      description: 'Leverage data insights to improve your tagging processes.',
      duration: '9:51',
      thumbnailClass: 'thumbnail-6'
    }
  ];
  selectedFile: File | null = null;
  isUploading = false;
  message = '';
  isError = false;

  constructor(private http: HttpClient) {}

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

    // Save the file to storage
    this.http.post('http://localhost:3000/api/upload', formData)
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
          
          // Also send the file to python backend
          this.http.post('http://localhost:8001/upload-video', formData)
            .subscribe(pythonResponse => console.log('Python response:', pythonResponse));

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
