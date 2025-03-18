import { Component } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  navItems = [
    { path: '/features', label: 'Features' },
    { path: '/about', label: 'About' },
    { path: '/references', label: 'References' },
    { path: '/blog', label: 'Blog' },
    { path: '/security', label: 'Security' },
    { path: '/faq', label: 'FAQ' },
    { path: '/videos', label: 'Videos' },
    {path: '/autoTag', label: 'autoTag'}
  ];
}