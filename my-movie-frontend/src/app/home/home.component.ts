
// // src/app/home/home.component.ts
// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { NavbarComponent } from '../navbar/navbar.component';
// import { MovieService } from '../service/movie.service';
// import { MovieDTO, PagedMoviesResponse } from '../model/movie.model';

// @Component({
//   standalone: true,
//   imports: [CommonModule, FormsModule, NavbarComponent],
//   templateUrl: './home.component.html',
//   styleUrls: ['./home.component.css']
// })
// export class HomeComponent implements OnInit {
//   filtersVisible = false;
//   filters = {
//     title: '',
//     genres: [] as string[],
//     yearFrom: null as number | null,
//     yearTo: null as number | null,
//     ratingFrom: null as number | null,
//     ratingTo: null as number | null,
//   };

//   allGenres: string[] = [];
//   searchResults: MovieDTO[] = [];

//   topRatedMovies: MovieDTO[] = [];
//   hybridRecommendations: MovieDTO[] = [];
//   allMovies: MovieDTO[] = [];
//   collaborativeRecommendations: MovieDTO[] = [];
//   watchedRecommendations: MovieDTO[] = [];
  

//   loading = {
//     topRated: true,
//     hybrid: true,
//     allMovies: true,
//     collaborative: true, 
//     watched: true
    
//   };

//   errors = {
//     topRated: '',
//     hybrid: '',
//     allMovies: '',
//     collaborative: '',
//     watched: ''
//   };

//   currentPage = 1;
//   perPage = 24;
//   totalMovies = 0;
//   totalPages = 0;
//   pages: number[] = [];

//   constructor(private movieService: MovieService, private router: Router) {}

//   ngOnInit(): void {
//     this.loadInitialData();
//     this.movieService.getAllGenres().subscribe({
//       next: genres => this.allGenres = genres,
//       error: () => this.allGenres = []
//     });
//   }

//   private loadInitialData(): void {
//     this.loadTopRated();
//     this.loadHybridRecommendations();
//     this.loadAllMovies();
//     this.loadCollaborativeRecommendations();
//     this.loadWatchedRecommendations(); 
//   }

//   toggleFilters(): void {
//     this.filtersVisible = !this.filtersVisible;
//   }

//   toggleGenre(genre: string): void {
//     const idx = this.filters.genres.indexOf(genre);
//     if (idx > -1) this.filters.genres.splice(idx, 1);
//     else this.filters.genres.push(genre);
//   }

//   searchMovies(): void {
//     this.movieService.searchMovies(
//       this.filters.title,
//       this.filters.genres,
//       this.filters.yearFrom,
//       this.filters.yearTo,
//       this.filters.ratingFrom,
//       this.filters.ratingTo
//     ).subscribe({
//       next: (resp: PagedMoviesResponse) => {
//         this.searchResults = resp.results;
//       },
//       error: err => console.error('Search error', err)
//     });
//   }

//   private loadTopRated(): void {
//     this.movieService.getTopRated().subscribe({
//       next: movies => {
//         this.topRatedMovies = this.transformMovieData(movies);
//         this.loading.topRated = false;
//       },
//       error: () => this.handleError('topRated', 'Failed to load top rated movies')
//     });
//   }

//   private loadHybridRecommendations(): void {
//     this.movieService.getHybridRecommendations().subscribe({
//       next: movies => {
//         this.hybridRecommendations = this.transformMovieData(movies);
//         this.loading.hybrid = false;
//       },
//       error: () => this.handleError('hybrid', 'Failed to load recommendations')
//     });
//   }

//   private loadCollaborativeRecommendations(): void {
//     this.movieService.getCollaborativeRecommendations().subscribe({
//       next: movies => {
//         this.collaborativeRecommendations = this.transformMovieData(movies);
//         this.loading.collaborative = false;
//       },
//       error: () => this.handleError('collaborative', 'Failed to load recommendations')
//     });
//   }

//   private loadWatchedRecommendations(): void {
//     this.movieService.getWatchedRecommendations().subscribe({
//       next: (movies) => {
//         this.watchedRecommendations = this.transformMovieData(movies);
//         this.loading.watched = false;
//       },
//       error: () => {
//         this.handleError('watched', 'Failed to load watched-based recommendations');
//       }
//     });
//   }

//   loadAllMovies(page: number = 1): void {
//     this.loading.allMovies = true;
  
//     this.movieService.getAllMovies(page, this.perPage).subscribe({
//       next: response => {
//         console.log('PAGED MOVIES RESPONSE ▶', response);
  
//         this.allMovies   = this.transformMovieData(response.results);
//         this.currentPage = response.page;
//         this.totalMovies = response.totalMovies ?? 0;
  
//         this.totalPages = Math.ceil(this.totalMovies / this.perPage);
//         this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  
//         this.loading.allMovies = false;
//       },
//       error: () => this.handleError('allMovies', 'Failed to load movies')
//     });
//   }
  


  

//   loadPage(page: number): void {
//     if (page < 1 || page > this.totalPages) return;
//     this.loadAllMovies(page);
//   }

//   private transformMovieData(movies: any[]): MovieDTO[] {
//     return movies.map(movie => ({
//       movieId: movie.movieId || movie.id,
//       title: movie.title,
//       genres: movie.genres || [],
//       poster_path: movie.poster_path || 'assets/no-image.jpg',
//       avg_rating: movie.avg_rating || 0,
//       num_ratings: movie.num_ratings || 0,
//       tmdb_rating: movie.tmdb_rating || movie.tmdbRating || 0,
//       vote_count: movie.vote_count || movie.num_ratings || 0,
//       overview: movie.overview || '',
//       release_year: Number(movie.release_year) || Number(movie.releaseDate?.split('-')[0]) || 0,
//       language: movie.language || movie.original_language,
//       duration: movie.duration || movie.runtime || 0
//     }));
//   }

//   private handleError(section: keyof typeof this.errors, message: string): void {
//     this.errors[section] = message;
//     this.loading[section] = false;
//     console.error(message);
//   }

//   viewMovieDetails(movieId: number): void {
//     this.router.navigate(['/movies', movieId]);
//   }
// }


import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { MovieService } from '../service/movie.service';
import { MovieDTO, PagedMoviesResponse } from '../model/movie.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NavbarComponent,
    SearchBarComponent,
    PaginationComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  filtersVisible = false;
  filters = {
    title: '',
    genres: [] as string[],
    yearFrom: null as number | null,
    yearTo: null as number | null,
    ratingFrom: null as number | null,
    ratingTo: null as number | null,
  };

  allGenres: string[] = [];
  searchResults: MovieDTO[] = [];
  showScrollTopButton = false;
  searchInputSubject = new Subject<string>();

  topRatedMovies: MovieDTO[] = [];
  hybridRecommendations: MovieDTO[] = [];
  allMovies: MovieDTO[] = [];
  collaborativeRecommendations: MovieDTO[] = [];
  watchedRecommendations: MovieDTO[] = [];

  loading = {
    topRated: true,
    hybrid: true,
    allMovies: true,
    collaborative: true, 
    watched: true
  };

  errors = {
    topRated: '',
    hybrid: '',
    allMovies: '',
    collaborative: '',
    watched: ''
  };

  // Pagination properties
  currentPage = 1;
  perPage = 24;
  totalMovies = 0;
  totalPages = 0;
  visiblePages = 5;
  pages: number[] = [];

  constructor(private movieService: MovieService, private router: Router) {
    // Setup search debounce
    this.searchInputSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filters.title = searchTerm;
      if (searchTerm.length > 2) {
        this.searchMovies();
      } else if (searchTerm.length === 0) {
        this.searchResults = [];
      }
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.movieService.getAllGenres().subscribe({
      next: genres => this.allGenres = genres,
      error: () => this.allGenres = []
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollTopButton = (window.scrollY > 300);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchInput(searchTerm: string) {
    this.searchInputSubject.next(searchTerm);
  }

  private loadInitialData(): void {
    this.loadTopRated();
    this.loadHybridRecommendations();
    this.loadAllMovies();
    this.loadCollaborativeRecommendations();
    this.loadWatchedRecommendations(); 
  }

  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }

  toggleGenre(genre: string): void {
    const idx = this.filters.genres.indexOf(genre);
    if (idx > -1) this.filters.genres.splice(idx, 1);
    else this.filters.genres.push(genre);
  }

  searchMovies(): void {
    this.movieService.searchMovies(
      this.filters.title,
      this.filters.genres,
      this.filters.yearFrom,
      this.filters.yearTo,
      this.filters.ratingFrom,
      this.filters.ratingTo
    ).subscribe({
      next: (resp: PagedMoviesResponse) => {
        this.searchResults = resp.results;
      },
      error: err => console.error('Search error', err)
    });
  }

  private loadTopRated(): void {
    this.movieService.getTopRated().subscribe({
      next: movies => {
        this.topRatedMovies = this.transformMovieData(movies);
        this.loading.topRated = false;
      },
      error: () => this.handleError('topRated', 'Failed to load top rated movies')
    });
  }

  private loadHybridRecommendations(): void {
    this.movieService.getHybridRecommendations().subscribe({
      next: movies => {
        this.hybridRecommendations = this.transformMovieData(movies);
        this.loading.hybrid = false;
      },
      error: () => this.handleError('hybrid', 'Failed to load recommendations')
    });
  }

  private loadCollaborativeRecommendations(): void {
    this.movieService.getCollaborativeRecommendations().subscribe({
      next: movies => {
        this.collaborativeRecommendations = this.transformMovieData(movies);
        this.loading.collaborative = false;
      },
      error: () => this.handleError('collaborative', 'Failed to load recommendations')
    });
  }

  private loadWatchedRecommendations(): void {
    this.movieService.getWatchedRecommendations().subscribe({
      next: (movies) => {
        this.watchedRecommendations = this.transformMovieData(movies);
        this.loading.watched = false;
      },
      error: () => {
        this.handleError('watched', 'Failed to load watched-based recommendations');
      }
    });
  }

  loadAllMovies(page: number = 1): void {
    this.loading.allMovies = true;
  
    this.movieService.getAllMovies(page, this.perPage).subscribe({
      next: response => {
        this.allMovies = this.transformMovieData(response.results);
        this.currentPage = response.page;
        this.totalMovies = response.totalMovies ?? 0;
  
        this.totalPages = Math.ceil(this.totalMovies / this.perPage);
        this.updateVisiblePages();
        
        this.loading.allMovies = false;
        
        // Smooth scroll to the top of the movies section when changing page
        document.getElementById('all-movies-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
      error: () => this.handleError('allMovies', 'Failed to load movies')
    });
  }

  updateVisiblePages(): void {
    // Calculate the range of pages to show
    let startPage = Math.max(1, this.currentPage - Math.floor(this.visiblePages / 2));
    let endPage = startPage + this.visiblePages - 1;
    
    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - this.visiblePages + 1);
    }
    
    this.pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  loadPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.loadAllMovies(page);
  }

  private transformMovieData(movies: any[]): MovieDTO[] {
    return movies.map(movie => ({
      movieId: movie.movieId || movie.id,
      title: movie.title,
      genres: movie.genres || [],
      poster_path: movie.poster_path || 'assets/no-image.jpg',
      avg_rating: movie.avg_rating || 0,
      num_ratings: movie.num_ratings || 0,
      tmdb_rating: movie.tmdb_rating || movie.tmdbRating || 0,
      vote_count: movie.vote_count || movie.num_ratings || 0,
      overview: movie.overview || '',
      release_year: Number(movie.release_year) || Number(movie.releaseDate?.split('-')[0]) || 0,
      language: movie.language || movie.original_language,
      duration: movie.duration || movie.runtime || 0
    }));
  }

  private handleError(section: keyof typeof this.errors, message: string): void {
    this.errors[section] = message;
    this.loading[section] = false;
    console.error(message);
  }

  viewMovieDetails(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }
}