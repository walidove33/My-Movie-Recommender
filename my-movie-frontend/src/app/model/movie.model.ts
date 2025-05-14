// src/app/models/movie.models.ts
// export interface Movie {
//   movieId: number;
//   title: string;
//   genres: string[];
//   poster_path: string;
//   overview: string;
//   release_year: number;
//   language: string;
//   duration: number;
//   tmdb_rating: number;
//   vote_count: number;
//   avg_rating?: number;
//   num_ratings?: number;
// }


// src/app/models/movie.models.ts
export interface Movie {
  movieId:    number;
  title:      string;
  genres:     string[];        // after service runs, this will definitely be an array
  poster_path:string;
  overview:   string;
  release_year: number;
  language:   string;
  duration:   number;
  tmdb_rating:number;
  vote_count: number;
  avg_rating?: number;
  num_ratings?: number;
}


export interface MovieDetailsResponse {
  movie: Movie;
  recommendations: Movie[];
}

export interface WatchedMovie {
  movieId: number;
  userId: number;
  watchedDate: Date;
}

// export interface MovieDTO {
//   movieId: number;
//   title: string;
//   genres: string[];
//   poster_path: string;
//   overview: string;
//   release_year: number;
//   language: string;
//   duration: number;
//   tmdb_rating: number;
//   vote_count: number;
//   avg_rating?: number;
//   num_ratings?: number;

// }



// In your movie.model.ts
export interface MovieDTO {
  movieId: number;
  title: string;
  genres: string[];
  poster_path: string;
  avg_rating: number;
  num_ratings: number;
  tmdb_rating?: number;
  vote_count?: number;
  overview?: string;
  release_year?: number;
  language?: string;
  duration?: number;
  // Add any other required properties
}
// src/app/model/paged-movies-response.model.ts

// src/app/model/paged-movies-response.model.ts

export interface PagedMoviesResponse {
  page:        number;       // current page
  perPage:     number;       // items per page
  totalMovies: number;       // total number of movies
  results:     MovieDTO[];   // the actual list of movies
}

