import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { FeaturesComponent } from './pages/features/features.component';
import { AboutComponent } from './pages/about/about.component';
import { ReferencesComponent } from './pages/references/references.component';
import { BlogComponent } from './pages/blog/blog.component';
import { SecurityComponent } from './pages/security/security.components';
import { FaqComponent } from './pages/faq/faq.components';
import { VideosComponent } from './pages/videos/videos.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'references', component: ReferencesComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'security', component: SecurityComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'videos', component: VideosComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }