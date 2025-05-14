import { Component, OnInit } from '@angular/core';
import { MovieService } from '../service/movie.service';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieDTO } from '../model/movie.model';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../lists/lists.component.html', // Shared template
  styleUrls: ['../lists/styles.css']
})
export class WatchedListComponent implements OnInit {
  movies: MovieDTO[] = [];
  loading = true;
  listTitle = 'Watched List';
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
      return;
    }

    this.movieService.getWatchedList(userId).subscribe({
      next: (movies) => {
        this.movies = movies;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load Watched list';
        this.loading = false;
        console.error(err);
      }
    });
  }

  removeFromList(movieId: number): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.movieService.removeFromWatched(userId, movieId).subscribe({
      next: () => this.loadMovies(),
      error: (err) => console.error('Failed to remove:', err)
    });
  }

  viewDetails(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }

  updateRating(movieId: number, newRating: number): void {
    this.movieService.rateMovie(movieId, newRating).subscribe({
      next: () => this.loadMovies(),
      error: (err) => console.error('Rating update failed:', err)
    });
  }
}