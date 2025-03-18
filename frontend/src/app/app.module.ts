import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

//Modules
import { videoModule } from './pages/auto-tag/auto-tag.module';

// Layout Components
import { HeaderComponent } from './components/layout/header/header.component';
import { NavigationComponent } from './components/layout/navigation/navigation.component';
import { FooterComponent } from './components/layout/footer/footer.component';

// Page Components
import { HomeComponent } from './pages/home/home.component';
import { FeaturesComponent } from './pages/features/features.component';
import { AboutComponent } from './pages/about/about.component';
import { ReferencesComponent } from './pages/references/references.component';
import { BlogComponent } from './pages/blog/blog.component';
import { SecurityComponent } from './pages/security/security.components';
import { FaqComponent } from './pages/faq/faq.components';
import { VideosComponent } from './pages/videos/videos.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavigationComponent,
    FooterComponent,
    HomeComponent,
    FeaturesComponent,
    AboutComponent,
    ReferencesComponent,
    BlogComponent,
    SecurityComponent,
    FaqComponent,
    VideosComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    videoModule,
    HttpClientModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }