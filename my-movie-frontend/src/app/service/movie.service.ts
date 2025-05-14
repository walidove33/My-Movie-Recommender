// src/app/service/movie.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PagedMoviesResponse }   
from '../model/movie.model';



import { AuthService } from './auth.service';
import { MovieDetailsResponse, MovieDTO } from '../model/movie.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private apiUrl = 'http://localhost:8090/api/movies';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getTopRated(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-rated`).pipe(
      catchError(error => {
        console.error('Error fetching top rated:', error);
        return throwError(() => new Error('Failed to load top rated movies'));
      })
    );
  }

  getHybridRecommendations(): Observable<any[]> {
    const token = this.authService.getToken();
    if (!token) throw new Error('No token available');

    const decoded = this.authService.jwtHelper.decodeToken(token);
    const userId = decoded?.userId || decoded?.sub;
    if (!userId) throw new Error('User ID not found in token');

    return this.http
      .get<any[]>(`${this.apiUrl}/recommendations/hybrid/${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching hybrid recommendations:', error);
          return throwError(() => new Error('Failed to load recommendations'));
        })
      );
  }




  getAllMovies(page: number = 1, perPage: number = 24): Observable<PagedMoviesResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
  
    return this.http.get<any>(`${this.apiUrl}/api/movies`, { params }).pipe(
      map(response => ({
        page: response.page,
        perPage: response.per_page,
        totalMovies: response.total_movies,  // <- mapped correctly
        results: response.results
      }))
    );
  }
  


  getMovieDetails(movieId: number): Observable<MovieDetailsResponse> {
    return this.http
      .get<MovieDetailsResponse>(`${this.apiUrl}/${movieId}`)
      .pipe(
        map(resp => {
          // --- Normalize genres: "A B C" → [ "A", "B", "C" ]
          if (typeof resp.movie.genres === 'string') {
            resp.movie.genres = (resp.movie.genres as any)
              .split(' ')
              .filter((g: string) => g.trim().length > 0);
          }
          // --- Ensure numeric fields are numbers
          resp.movie.release_year = Number(resp.movie.release_year) || 0;
          resp.movie.duration     = Number(resp.movie.duration)     || 0;
          resp.movie.tmdb_rating  = Number(resp.movie.tmdb_rating)  || 0;
          resp.movie.vote_count   = Number(resp.movie.vote_count)   || 0;
          return resp;
        }),
        catchError(error => {
          if (error.status === 404) {
            return throwError(() => new Error('Movie not found'));
          }
          return throwError(() => new Error('Server error'));
        })
      );
  }

  getCollaborativeRecommendations(): Observable<any[]> {
    const token = this.authService.getToken();
    if (!token) throw new Error('No token available');

    const decoded = this.authService.jwtHelper.decodeToken(token);
    const userId = decoded?.userId || decoded?.sub;
    if (!userId) throw new Error('User ID not found in token');

    return this.http
      .get<any[]>(`${this.apiUrl}/recommendations/collaborative/${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching collaborative recommendations:', error);
          return throwError(() => new Error('Failed to load recommendations'));
        })
      );
  }


getWatchedRecommendations(topN: number = 10): Observable<MovieDTO[]> {
  const token = this.authService.getToken();
  if (!token) throw new Error('No token available');

  const decoded = this.authService.jwtHelper.decodeToken(token);
  const userId = decoded?.userId || decoded?.sub;
  if (!userId) throw new Error('User ID not found in token');

  const params = new HttpParams().set('topN', topN.toString());

  return this.http
    .get<MovieDTO[]>(`${this.apiUrl}/recommendations/watched/${userId}`, { params })
    .pipe(
      catchError(error => {
        console.error('Error fetching watched-based recommendations:', error);
        return throwError(() => new Error('Failed to load recommendations'));
      })
    );
}

  getUserRating(movieId: number): Observable<number | null> {
    return this.http.get<number>(`${this.apiUrl}/${movieId}/rating`).pipe(
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        return throwError(() => new Error(`Failed to fetch rating: ${error.message}`));
      })
    );
  }

  rateMovie(movieId: number, rating: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${movieId}/rate`, { rating }).pipe(
      catchError(error => {
        console.error('Error submitting rating:', error);
        return throwError(() => new Error('Failed to submit rating'));
      })
    );
  }

  markMovieAsWatched(movieId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${movieId}/watched?userId=${userId}`, {});
  }

  markMovieAsToWatch(movieId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${movieId}/to-watch?userId=${userId}`, {});
  }

  getToWatchList(userId: number): Observable<MovieDTO[]> {
    return this.http.get<MovieDTO[]>(`${this.apiUrl}/to-watch?userId=${userId}`);
  }

  getWatchedList(userId: number): Observable<MovieDTO[]> {
    return this.http.get<MovieDTO[]>(`${this.apiUrl}/watched?userId=${userId}`);
  }

  removeFromToWatch(userId: number, movieId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${movieId}/to-watch`, {
        params: new HttpParams().set('userId', userId.toString())
      })
      .pipe(
        catchError(error => {
          console.error('Delete error:', error);
          return throwError(() => new Error('Failed to remove from list'));
        })
      );
  }

  removeFromWatched(userId: number, movieId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${movieId}/watched?userId=${userId}`);
  }

  searchMovies(
    title: string,
    genres: string[],
    yearFrom: number | null,
    yearTo: number | null,
    ratingFrom: number | null,
    ratingTo: number | null
  ): Observable<any> {
    let params = new HttpParams();
    if (title) params = params.set('title', title);
    if (genres?.length) genres.forEach(g => (params = params.append('genres', g)));
    if (yearFrom !== null) params = params.set('yearFrom', yearFrom.toString());
    if (yearTo   !== null) params = params.set('yearTo',   yearTo.toString());
    if (ratingFrom !== null) params = params.set('ratingFrom', ratingFrom.toString());
    if (ratingTo   !== null) params = params.set('ratingTo',   ratingTo.toString());

    return this.http.get<any>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(err => {
        console.error('Search error:', err);
        return throwError(() => new Error('Search failed'));
      })
    );
  }

  getAllGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/genres`);
  }
}
