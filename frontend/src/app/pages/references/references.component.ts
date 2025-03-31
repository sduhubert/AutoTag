import { Component } from '@angular/core';

interface Reference {
  id: number;
  company: string;
  position: string;
  quote: string;
}

@Component({
  selector: 'app-references',
  templateUrl: './references.component.html',
  styleUrls: ['./references.component.scss']
})
export class ReferencesComponent {
  references: Reference[] = [
    {
      id: 1,
      company: 'Tech Solutions Inc.',
      position: 'CTO',
      quote: 'Auto Tag has transformed our data management process. The automation capabilities have saved us countless hours and improved accuracy tremendously.'
    },
    {
      id: 2,
      company: 'Global Media Group',
      position: 'Head of Content',
      quote: 'Implementing Auto Tag was one of the best decisions we made. Our content categorization is now seamless and the search functionality is exceptional.'
    },
    {
      id: 3,
      company: 'Enterprise Systems',
      position: 'Project Manager',
      quote: 'The customization options in Auto Tag allowed us to tailor the system perfectly to our complex workflow requirements.'
    },
    {
      id: 4,
      company: 'Digital Solutions Ltd',
      position: 'CEO',
      quote: 'Auto Tag intuitive interface and powerful backend have made it an indispensable tool for our organization. Highly recommended!'
    }
  ];
}