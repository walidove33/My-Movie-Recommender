// header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router ,ActivatedRoute } from '@angular/router';
import { MovieService } from '../service/movie.service';
import { Movie } from '../model/movie.model';
import { AuthService } from '../service/auth.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentPosterIndex = 0;
  currentQuoteIndex = 0;
  private intervalId: any;
  movies: Movie[] = [];
  loading = true;
  error = '';
  isAuthPage = false;


  quotes = [
    "Cinema is life with the dull bits cut out",
    "We watch movies to feel alive in other lives",
    "Every film is a journey into the unexpected",
    "Great stories change how we see the world"
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private authService: AuthService // Add this injection

  ) {}

  ngOnInit() {
    this.checkCurrentRoute();
    if (!this.isAuthPage) {
      this.loadMovies();
    }
  }

  private checkCurrentRoute() {
    this.isAuthPage = this.router.url.includes('/login') || 
                     this.router.url.includes('/register');
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private loadMovies() {
    this.movieService.getTopRated().subscribe({
      next: (movies) => {
        this.movies = movies.slice(0, 8); // Load 8 movies
        this.loading = false;
        this.startCarousel();
      },
      error: (err) => {
        this.error = 'Failed to load featured movies';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private startCarousel() {
    this.intervalId = setInterval(() => {
      this.currentPosterIndex = (this.currentPosterIndex + 1) % this.movies.length;
      this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
    }, 5000);
  }

  viewDetails() {
    if (this.authService.isAuthenticated()) {
      const movieId = this.movies[this.currentPosterIndex]?.movieId;
      if (movieId) this.router.navigate(['/movies', movieId]);
    } else {
      this.router.navigate(['/login'], { 
        state: { scrollToDetails: true },
        fragment: 'login-form'
      });
    }
  }
}