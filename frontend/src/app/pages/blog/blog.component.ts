import { Component } from '@angular/core';

interface BlogPost {
  id: number;
  title: string;
  date: string;
  summary: string;
  imageClass: string;
}

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent {
  blogPosts: BlogPost[] = [
    {
      id: 1,
      title: 'The Future of Automated Tagging',
      date: 'March 15, 2025',
      summary: 'Discover how AI-powered tagging is revolutionizing data management and improving operational efficiency.',
      imageClass: 'image-1'
    },
    {
      id: 2,
      title: 'Streamlining Workflow with Auto Tag',
      date: 'March 8, 2025',
      summary: 'Learn how businesses are saving hours of manual work by implementing intelligent tagging solutions.',
      imageClass: 'image-2'
    },
    {
      id: 3,
      title: 'Best Practices for Data Organization',
      date: 'February 28, 2025',
      summary: 'Explore the top strategies for keeping your digital assets organized and easily accessible.',
      imageClass: 'image-3'
    },
    {
      id: 4,
      title: 'Auto Tag Feature Spotlight: Batch Processing',
      date: 'February 20, 2025',
      summary: 'A deep dive into one of our most powerful features and how it can transform your workflow.',
      imageClass: 'image-4'
    },
    {
      id: 5,
      title: 'Customer Success Story: Global Media Group',
      date: 'February 12, 2025',
      summary: 'How a major media company reduced tagging time by 85% using Auto Tag intelligent automation.',
      imageClass: 'image-5'
    },
    {
      id: 6,
      title: 'Upcoming Features: What is New in Auto Tag',
      date: 'February 5, 2025',
      summary: 'A sneak peek at exciting new features coming to the Auto Tag platform in the next quarter.',
      imageClass: 'image-6'
    }
  ];
}