import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Layout Components
import { HeaderComponent } from 'src/app/components/layout/header/header.component';
import { NavigationComponent } from 'src/app/components/layout/navigation/navigation.component';
import { FooterComponent } from 'src/app/components/layout/footer/footer.component';

// Page Components
import { HomeComponent } from 'src/app/pages/home/home.component';
import { FeaturesComponent } from 'src/app/pages/features/features.component';
import { AboutComponent } from 'src/app/pages/about/about.component';
import { ReferencesComponent } from 'src/app/pages/references/references.component';
import { BlogComponent } from 'src/app/pages/blog/blog.component';
import { SecurityComponent } from 'src/app/pages/security/security.component';
import { FaqComponent } from 'src/app/pages/faq/faq.component';
import { VideosComponent } from 'src/app/pages/videos/videos.component';

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
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }