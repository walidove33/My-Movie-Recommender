import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { AuthGuard } from './service/auth.guard';
import { ToWatchListComponent } from './to-watch-list/to-watch-list.component';
import { WatchedListComponent } from './watched-list/watched-list.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  // Unauthenticated
  { path: 'login', component: LoginComponent ,
    data: { showSimpleNavbar: true }
   },
  
  { path: 'register', component: RegisterComponent,
    data: { showSimpleNavbar: true }

   },

   { path: 'profile', component: ProfileComponent },



   { path: 'movies/:id', component: MovieDetailsComponent },

  // Protected
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'movies/:id', component: MovieDetailsComponent, canActivate: [AuthGuard] },
  { 
    path: 'to-watch', 
    component: ToWatchListComponent,
    canActivate: [AuthGuard],
    data: { title: 'ToWatch List' }
  },
  { 
    path: 'watched', 
    component: WatchedListComponent,
    canActivate: [AuthGuard],
    data: { title: 'Watched List' }
  },
  

  // Default & fallback
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },



  
];
