
// import { Component, OnInit } from '@angular/core';
// import { MovieService } from '../service/movie.service';
// import { AuthService } from '../service/auth.service';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { MovieDTO } from '../model/movie.model';

// @Component({
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: '../lists/lists.component.html',  // <-- shared template
//   styleUrls: ['../lists/styles.css']
// })
// export class ToWatchListComponent implements OnInit {
//   movies: MovieDTO[] = [];
//   loading = true;
//   listTitle = 'To-Watch List';       // <-- dynamic title
//   error = '';

//   constructor(
//     private movieService: MovieService,
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.loadMovies();
//   }

//   private loadMovies(): void {
//     const userId = this.authService.getUserId();
//     if (!userId) {
//       this.error = 'User not authenticated';
//       this.loading = false;
//       return;
//     }

//     this.movieService.getToWatchList(userId).subscribe({
//       next: (movies) => {
//         this.movies = movies;
//         this.loading = false;
//       },
//       error: (err) => {
//         console.error(err);
//         this.error = 'Failed to load To-Watch list';
//         this.loading = false;
//       }
//     });
//   }

//   removeFromList(movieId: number): void {
//     const userId = this.authService.getUserId();
//     if (!userId) { return; }

//     this.movieService.removeFromToWatch(userId, movieId).subscribe({
//       next: () => this.loadMovies(),
//       error: (err) => console.error('Failed to remove:', err)
//     });
//   }

//   viewDetails(movieId: number): void {
//     this.router.navigate(['/movies', movieId]);
//   }
// }







import { Component, OnInit } from '@angular/core';
import { MovieService } from '../service/movie.service';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieDTO } from '../model/movie.model';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../Lists/Lists.component.html',
  styleUrls: ['../lists/styles.css']
})
export class ToWatchListComponent implements OnInit {
  movies: MovieDTO[] = [];
  loading = true;
  listTitle = 'To-Watch List';
  error = '';

  constructor(
    private movieService: MovieService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  private loadMovies(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    this.movieService.getToWatchList(userId).subscribe({
      next: (movies) => {
        this.movies = movies;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load To-Watch list';
        this.loading = false;
      }
    });
  }

  removeFromList(movieId: number): void {
    const userId = this.authService.getUserId();
    if (!userId) { return; }

    this.movieService.removeFromToWatch(userId, movieId).subscribe({
      next: () => this.loadMovies(),
      error: (err) => console.error('Failed to remove:', err)
    });
  }

  viewDetails(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }
  
  onImageError(event: any): void {
    event.target.src = 'https://images.pexels.com/photos/3945317/pexels-photo-3945317.jpeg?auto=compress&cs=tinysrgb&w=600';
  }
}
