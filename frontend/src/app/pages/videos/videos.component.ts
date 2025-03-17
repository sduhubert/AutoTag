import { Component } from '@angular/core';

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
}