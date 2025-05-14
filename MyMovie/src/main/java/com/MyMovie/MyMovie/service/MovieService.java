package com.MyMovie.MyMovie.service;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import jakarta.persistence.criteria.Predicate;
import com.MyMovie.MyMovie.dao.dto.PagedMoviesResponse;
import com.MyMovie.MyMovie.dao.dto.MovieDTO;
import com.MyMovie.MyMovie.dao.dto.MovieDetailResponse;
import com.MyMovie.MyMovie.dao.dto.PagedMoviesResponse;
import com.MyMovie.MyMovie.dao.entities.Movie;
import com.MyMovie.MyMovie.dao.entities.ToWatchMovie;
import com.MyMovie.MyMovie.dao.entities.WatchedMovie;
import com.MyMovie.MyMovie.dao.repository.MovieRepository;
import com.MyMovie.MyMovie.dao.repository.RatingRepository;
import com.MyMovie.MyMovie.dao.repository.ToWatchMovieRepository;
import com.MyMovie.MyMovie.dao.repository.WatchedMovieRepository;
import com.MyMovie.MyMovie.exception.NotFoundException;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MovieService {



    private static final Logger logger = LoggerFactory.getLogger(RecommendationService.class);

    private final RatingRepository ratingRepository;

    private final String flaskBaseUrl;

    @Autowired
    private MovieRepository movieRepository;

    private final RestTemplate restTemplate;


    public MovieService(RestTemplateBuilder restTemplateBuilder,
                                 @Value("${flask.api.base-url}") String flaskBaseUrl , RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
        this.restTemplate = restTemplateBuilder.build();
        this.flaskBaseUrl = flaskBaseUrl;
    }



    private MovieDTO convertToDto(Movie movie) {
        return new MovieDTO(
                movie.getMovieId(),
                movie.getTitle(),
                Arrays.asList(movie.getGenres().split("\\|")),
                movie.getPosterPath(),
                movie.getTmdbRating(), // avgRating
                movie.getVoteCount(),  // numRatings
                movie.getOverview(),
                movie.getReleaseYear(),
                movie.getDuration(),
                movie.getLanguage(),
                null, // userRating (will be populated separately)
                movie.getTmdbRating(),
                movie.getVoteCount()
        );
    }


    private MovieDetailResponse fallbackToDatabase(int movieId) {
        try {
            logger.info("Attempting database fallback for movie {}", movieId);
            Movie movie = movieRepository.findById(movieId)
                    .orElseThrow(() -> new NotFoundException("Movie not found in database"));

            return new MovieDetailResponse(
                    convertToDto(movie),
                    Collections.emptyList()
            );
        } catch (NotFoundException ex) {
            logger.error("Movie {} not found in any source", movieId);
            throw ex;
        }
    }
    private MovieDetailResponse getMovieFromDatabase(int movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new NotFoundException("Movie not found"));

        return new MovieDetailResponse(
                convertToDto(movie),
                Collections.emptyList() // No recommendations from DB
        );
    }

    public MovieDetailResponse getMovieDetails(int movieId) {
        try {
            String url = String.format("%s/api/movies/%d", flaskBaseUrl, movieId);
            logger.debug("Attempting to fetch movie {} from Flask: {}", movieId, url);

            ResponseEntity<String> rawResponse = restTemplate.getForEntity(url, String.class);
            logger.debug("Raw Flask response: {}", rawResponse.getBody());

            ResponseEntity<MovieDetailResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<MovieDetailResponse>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                MovieDetailResponse details = response.getBody();
                validateMovieResponse(details); // New validation method
                return details;
            }

            return fallbackToDatabase(movieId);

        } catch (HttpClientErrorException.NotFound ex) {
            logger.warn("Movie {} not found in Flask", movieId);
            return fallbackToDatabase(movieId);
        } catch (RestClientException ex) {
            logger.error("Flask communication error: {}", ex.getMessage());
            return fallbackToDatabase(movieId);
        } catch (Exception ex) {
            logger.error("Unexpected error: {}", ex.getMessage());
            throw new RuntimeException("Failed to load movie details");
        }
    }


    private void validateMovieResponse(MovieDetailResponse response) {
        if (response.getMovie() == null) {
            throw new ValidationException("Invalid movie data from Flask");
        }

        MovieDTO movie = response.getMovie();
        if (movie.getTitle() == null || movie.getTitle().isEmpty()) {
            throw new ValidationException("Missing title in movie data");
        }
    }







    public List<MovieDTO> getMoviesByIds(List<Integer> movieIds) {
        if (movieIds == null || movieIds.isEmpty()) {
            return Collections.emptyList();
        }

        return movieRepository.findAllById(movieIds)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // src/main/java/com/MyMovie/MyMovie/service/RecommendationService.java



    public PagedMoviesResponse searchMovies(
            String title,
            List<String> genres,
            Integer yearFrom, Integer yearTo,
            Double ratingFrom, Double ratingTo,
            int page, int perPage
    ) {
        // 1) Build specification
        Specification<Movie> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (title != null && !title.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
            }
            if (genres != null && !genres.isEmpty()) {
                predicates.add(root.get("genres").in(genres));
            }
            if (yearFrom != null) {
                predicates.add(cb.ge(root.get("releaseYear"), yearFrom));
            }
            if (yearTo != null) {
                predicates.add(cb.le(root.get("releaseYear"), yearTo));
            }
            // For ratingFrom/ratingTo you could either join the Rating table
            // or filter on your TMDB rating proxy field:
            if (ratingFrom != null) {
                predicates.add(cb.ge(root.get("tmdbRating"), ratingFrom));
            }
            if (ratingTo   != null) {
                predicates.add(cb.le(root.get("tmdbRating"), ratingTo));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // 2) Page through JPA
        PageRequest pgReq = PageRequest.of(page - 1, perPage);
        Page<Movie> moviePage = movieRepository.findAll(spec, pgReq);

        // 3) Convert to DTOs (and merge your avg_rating & num_ratings from RatingRepository)
        List<MovieDTO> dtos = moviePage.getContent().stream()
                .map(m -> {
                    MovieDTO dto = convertToDto(m);
                    RatingRepository.RatingStats stats = ratingRepository.findStatsByMovieId(m.getMovieId());
                    dto.setAvgRating(stats.getAvgRating());
                    dto.setNumRatings(stats.getNumRatings());
                    return dto;
                })
                .toList();

        // 4) Wrap in your PagedMoviesResponse
        return PagedMoviesResponse.of(page, perPage, moviePage.getTotalElements(), dtos);
    }





    @Autowired
    private WatchedMovieRepository watchedRepo;

    @Autowired
    private ToWatchMovieRepository toWatchRepo;


    public WatchedMovie markAsWatched(int userId, int movieId) {
        // 1) Remove movie from To-Watch if it exists
        toWatchRepo.deleteByUserIdAndMovieId(userId, movieId);

        // 2) Check if movie already marked as Watched
        Optional<WatchedMovie> existingWatched = watchedRepo
                .findByUserIdAndMovieId(userId, movieId);
        if (existingWatched.isPresent()) {
            return existingWatched.get();  // Movie already marked as Watched, return it
        }

        // 3) Insert movie into WatchedMovie table
        WatchedMovie watchedMovie = new WatchedMovie();
        watchedMovie.setUserId(userId);
        watchedMovie.setMovieId(movieId);
        return watchedRepo.save(watchedMovie);
    }



    public ToWatchMovie markAsToWatch(int userId, int movieId) {
        // 1) Remove movie from Watched if it exists
        watchedRepo.deleteByUserIdAndMovieId(userId, movieId);

        // 2) Check if movie already marked as To-Watch
        Optional<ToWatchMovie> existingToWatch = toWatchRepo
                .findByUserIdAndMovieId(userId, movieId);
        if (existingToWatch.isPresent()) {
            return existingToWatch.get();  // Movie already marked as To-Watch, return it
        }

        // 3) Insert movie into ToWatchMovie table
        ToWatchMovie toWatchMovie = new ToWatchMovie();
        toWatchMovie.setUserId(userId);
        toWatchMovie.setMovieId(movieId);
        return toWatchRepo.save(toWatchMovie);
    }




    @Transactional  // transaction boundary at service layer
    public void removeFromWatchedList(int userId, int movieId) {
        watchedRepo.deleteByUserIdAndMovieId(userId, movieId);
    }

    @Transactional
    public void removeFromToWatchList(int userId, int movieId) {
        toWatchRepo.deleteByUserIdAndMovieId(userId, movieId);
    }




}


