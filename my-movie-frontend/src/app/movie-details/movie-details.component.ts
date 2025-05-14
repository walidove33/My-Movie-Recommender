// // 

// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, ParamMap, Router } from '@angular/router';
// import { NavbarComponent } from '../navbar/navbar.component';
// import { MovieService } from '../service/movie.service';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../service/auth.service';
// import { Location } from '@angular/common';
// import { trigger, transition, style, animate } from '@angular/animations';

// @Component({
//   standalone: true,
//   imports: [CommonModule, NavbarComponent],
//   templateUrl: './movie-details.component.html',
//   styleUrls: ['./movie-details.component.css'],
//   animations: [
//     trigger('fadeIn', [
//       transition(':enter', [
//         style({ opacity: 0, transform: 'translateY(10px)' }),
//         animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
//       ])
//     ]),
//     trigger('fadeInOut', [
//       transition(':enter', [
//         style({ opacity: 0 }),
//         animate('300ms ease-out', style({ opacity: 1 }))
//       ]),
//       transition(':leave', [
//         animate('300ms ease-in', style({ opacity: 0 }))
//       ])
//     ])
//   ]
// })
// export class MovieDetailsComponent implements OnInit {
  
//   movie: any;
//   recommendations: any[] = [];
//   hybridRecommendations: any[] = [];

//   loading = true;
//   loadingStates = {
//     hybrid: true
//   };

//   error = '';
//   errors = {
//     hybrid: ''
//   };

//   userRating: number | null = null;
//   newRating = 0;

//   constructor(
//     public authService: AuthService,
//     private route: ActivatedRoute,
//     private router: Router,
//     private movieService: MovieService,
//     private location: Location
//   ) {}

//   ngOnInit(): void {
//     // Subscribe to route param changes to reload on same component navigation
//     this.route.paramMap.subscribe((params: ParamMap) => {
//       const idParam = params.get('id');
//       if (idParam) {
//         const id = +idParam;
//         this.resetState();
//         this.loadMovieDetails(id);
//         this.loadHybridRecommendations();
//         if (this.authService.isAuthenticated()) {
//           this.loadUserRating(id);
//         }
//       } else {
//         this.handleError('Invalid movie ID');
//       }
//     });
//   }

//   private resetState(): void {
//     this.movie = null;
//     this.recommendations = [];
//     this.hybridRecommendations = [];
//     this.loading = true;
//     this.loadingStates.hybrid = true;
//     this.error = '';
//     this.errors.hybrid = '';
//     this.userRating = null;
//     this.newRating = 0;
//   }

//   private loadMovieDetails(movieId: number): void {
//     this.movieService.getMovieDetails(movieId).subscribe({
//       next: (response) => {
//         this.movie = response.movie;
        
        
//         this.recommendations = response.recommendations || [];
//         this.loading = false;
//       },
//       error: (err) => {
//         if (err.status === 404) {
//           this.handleError('Movie not found');
//         } else {
//           this.handleError('Failed to load details');
//         }
//       }
//     });
//   }

//   private loadHybridRecommendations(): void {
//     this.movieService.getHybridRecommendations().subscribe({
//       next: (movies) => {
//         this.hybridRecommendations = this.transformMovieData(movies);
//         this.loadingStates.hybrid = false;
//       },
//       error: () => {
//         this.errors.hybrid = 'Failed to load hybrid recommendations';
//         this.loadingStates.hybrid = false;
//       }
//     });
//   }

//   private loadUserRating(movieId: number): void {
//     this.movieService.getUserRating(movieId).subscribe({
//       next: (rating) => this.userRating = rating,
//       error: (err) => {
//         if (err.status === 404) {
//           this.userRating = null;
//         } else {
//           console.error('Rating load error:', err);
//         }
//       }
//     });
//   }

//   rateMovie(): void {
//     if (!this.movie) {
//       return;
//     }
//     this.movieService.rateMovie(this.movie.movieId, this.newRating).subscribe({
//       next: () => {
//         this.userRating = this.newRating;
//         this.newRating = 0;
//         // Refresh details and recommendations
//         this.loadMovieDetails(this.movie.movieId);
//       },
//       error: () => console.error('Failed to submit rating')
//     });
//   }

//   viewMovieDetails(movieId: number): void {
//     // Scrolls to top when navigating to the same component
//     window.scrollTo(0, 0);
//     this.router.navigate(['/movies', movieId]);
//   }

//   markAsWatched(): void {
//     if (!this.movie) {
//       return;
//     }
//     const userId = this.authService.getUserId();
//     if (!userId) {
//       return;
//     }
//     this.movieService.markMovieAsWatched(this.movie.movieId, userId).subscribe({
//       next: res => console.log('Watched:', res),
//       error: err => console.error(err)
//     });
//   }

//   markAsToWatch(): void {
//     if (!this.movie) {
//       return;
//     }
//     const userId = this.authService.getUserId();
//     if (!userId) {
//       return;
//     }
//     this.movieService.markMovieAsToWatch(this.movie.movieId, userId).subscribe({
//       next: res => console.log('To‑Watch:', res),
//       error: err => console.error(err)
//     });
//   }

//   goBack(): void {
//     this.location.back();
//   }

//   private handleError(message: string): void {
//     this.error = message;
//     this.loading = false;
//     console.error(message);
//   }

//   private transformMovieData(movies: any[]): any[] {
//     return movies.map(movie => ({
//       movieId: movie.movieId || movie.id,
//       title: movie.title,
//       genres: movie.genres || [],
//       poster_path: movie.poster_path || 'assets/no-image.jpg',
//       avg_rating: movie.avg_rating || 0,
//       num_ratings: movie.num_ratings || 0
//     }));
//   }
// }




import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MovieService } from '../service/movie.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth.service';
import { Location } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css']
})
export class MovieDetailsComponent implements OnInit {
  
  movie: any;
  recommendations: any[] = [];
  hybridRecommendations: any[] = [];

  loading = true;
  loadingStates = {
    hybrid: true
  };

  error = '';
  errors = {
    hybrid: ''
  };

  userRating: number | null = null;
  newRating = 0;

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Subscribe to route param changes to reload on same component navigation
    this.route.paramMap.subscribe((params: ParamMap) => {
      const idParam = params.get('id');
      if (idParam) {
        const id = +idParam;
        this.resetState();
        this.loadMovieDetails(id);
        this.loadHybridRecommendations();
        if (this.authService.isAuthenticated()) {
          this.loadUserRating(id);
        }
      } else {
        this.handleError('Invalid movie ID');
      }
    });
  }

  private resetState(): void {
    this.movie = null;
    this.recommendations = [];
    this.hybridRecommendations = [];
    this.loading = true;
    this.loadingStates.hybrid = true;
    this.error = '';
    this.errors.hybrid = '';
    this.userRating = null;
    this.newRating = 0;
  }

  private loadMovieDetails(movieId: number): void {
    this.movieService.getMovieDetails(movieId).subscribe({
      next: (response) => {
        this.movie = response.movie;
        
        // Set backdrop if not available
        if (!this.movie.backdrop_path) {
          this.movie.backdrop_path = 'https://images.pexels.com/photos/65128/pexels-photo-65128.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
        }
        
        this.recommendations = response.recommendations || [];
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.handleError('Movie not found');
        } else {
          this.handleError('Failed to load details');
        }
      }
    });
  }

  private loadHybridRecommendations(): void {
    this.movieService.getHybridRecommendations().subscribe({
      next: (movies) => {
        this.hybridRecommendations = this.transformMovieData(movies);
        this.loadingStates.hybrid = false;
      },
      error: () => {
        this.errors.hybrid = 'Failed to load hybrid recommendations';
        this.loadingStates.hybrid = false;
      }
    });
  }

  private loadUserRating(movieId: number): void {
    this.movieService.getUserRating(movieId).subscribe({
      next: (rating) => this.userRating = rating,
      error: (err) => {
        if (err.status === 404) {
          this.userRating = null;
        } else {
          console.error('Rating load error:', err);
        }
      }
    });
  }

  rateMovie(): void {
    if (!this.movie) {
      return;
    }
    this.movieService.rateMovie(this.movie.movieId, this.newRating).subscribe({
      next: () => {
        this.userRating = this.newRating;
        this.newRating = 0;
        // Refresh details and recommendations
        this.loadMovieDetails(this.movie.movieId);
      },
      error: () => console.error('Failed to submit rating')
    });
  }

  viewMovieDetails(movieId: number): void {
    // Scrolls to top when navigating to the same component
    window.scrollTo(0, 0);
    this.router.navigate(['/movies', movieId]);
  }

 // Update your component methods
markAsWatched(event: MouseEvent) {
  const button = event.currentTarget as HTMLElement;
  if (!this.movie) return;

  button.classList.add('active');
  setTimeout(() => button.classList.remove('active'), 2000);

  const userId = this.authService.getUserId();
  if (!userId) return;

  this.movieService.markMovieAsWatched(this.movie.movieId, userId).subscribe({
    next: () => {
      // Optional: Update button state permanently if needed
    },
    error: (err) => {
      console.error(err);
      button.classList.remove('active');
    }
  });
}

markAsToWatch(event: MouseEvent) {
  const button = event.currentTarget as HTMLElement;
  if (!this.movie) return;

  button.classList.add('active');
  setTimeout(() => button.classList.remove('active'), 2000);

  const userId = this.authService.getUserId();
  if (!userId) return;

  this.movieService.markMovieAsToWatch(this.movie.movieId, userId).subscribe({
    next: () => {
      // Optional: Update button state permanently if needed
    },
    error: (err) => {
      console.error(err);
      button.classList.remove('active');
    }
  });
}

  goBack(): void {
    this.location.back();
  }

  private handleError(message: string): void {
    this.error = message;
    this.loading = false;
    console.error(message);
  }

  private transformMovieData(movies: any[]): any[] {
    return movies.map(movie => ({
      movieId: movie.movieId || movie.id,
      title: movie.title,
      genres: movie.genres || [],
      poster_path: movie.poster_path || 'assets/no-image.jpg',
      avg_rating: movie.avg_rating || 0,
      num_ratings: movie.num_ratings || 0
    }));
  }
}