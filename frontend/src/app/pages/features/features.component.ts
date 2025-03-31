import { Component } from '@angular/core';

interface Feature {
  id: number;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      id: 1,
      title: 'Automated Tagging',
      description: 'Intelligent tagging system that automatically categorizes content based on your custom rules.'
    },
    {
      id: 2,
      title: 'Batch Processing',
      description: 'Process thousands of items simultaneously with powerful batch processing capabilities.'
    },
    {
      id: 3,
      title: 'Custom Workflows',
      description: 'Create and customize your workflows to match your unique business processes and requirements.'
    },
    {
      id: 4,
      title: 'Advanced Analytics',
      description: 'Gain insights from your data with comprehensive analytics and reporting tools.'
    },
    {
      id: 5,
      title: 'API Integration',
      description: 'Seamlessly integrate with your existing systems through our powerful API.'
    },
    {
      id: 6,
      title: 'Team Collaboration',
      description: 'Enable your team to work together efficiently with collaborative features and permissions.'
    }
  ];
}