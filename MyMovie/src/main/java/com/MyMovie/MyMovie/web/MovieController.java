// MovieController.java (updated)
package com.MyMovie.MyMovie.web;

import com.MyMovie.MyMovie.dao.repository.ToWatchMovieRepository;
import com.MyMovie.MyMovie.exception.NotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Arrays;

import com.MyMovie.MyMovie.dao.dto.MovieDTO;
import com.MyMovie.MyMovie.dao.dto.MovieDetailResponse;
import com.MyMovie.MyMovie.dao.dto.PagedMoviesResponse;
import com.MyMovie.MyMovie.dao.dto.RecommendationResponse;
import com.MyMovie.MyMovie.dao.embeddable.RatingId;
import com.MyMovie.MyMovie.dao.entities.AppUser;
import com.MyMovie.MyMovie.dao.entities.Rating;
import com.MyMovie.MyMovie.dao.entities.ToWatchMovie;
import com.MyMovie.MyMovie.dao.entities.WatchedMovie;
import com.MyMovie.MyMovie.dao.repository.AppUserRepository;
import com.MyMovie.MyMovie.dao.repository.RatingRepository;
import com.MyMovie.MyMovie.dao.repository.WatchedMovieRepository;
import com.MyMovie.MyMovie.service.MovieService;
import com.MyMovie.MyMovie.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/movies")
public class MovieController {


    private static final Logger logger = LoggerFactory.getLogger(RecommendationService.class);
    private final RecommendationService recommendationService;

    public MovieController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @Autowired
    private MovieService movieService;
    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private RatingRepository ratingRepository;



    @GetMapping("/genres")
    public List<String> getAllGenres() {
        return List.of("Action", "Comedy", "Drama", "Thriller", "Horror", "Romance" ,"Adventure ", "Mystery", "Sci-Fi", "Fantasy", "Animation", "Family", "Musical", "War", "History", "Documentary", "Western", "Foreign", "Science Fiction", "Crime");
    }


    @GetMapping("/recommendations/hybrid/{userId}")
    public ResponseEntity<?> getHybridRecommendations(
            @PathVariable int userId,
            @RequestParam(defaultValue = "10") int top_n) {
        try {
            return ResponseEntity.ok(recommendationService.getHybridRecommendations(userId, top_n));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Recommendation failed", "detail", e.getMessage()));
        }
    }

    @GetMapping("/top-rated")
    public List<MovieDTO> getTopRated(@RequestParam(defaultValue = "100") int minRatings) {
        return recommendationService.getTopRated(minRatings);
    }

    @GetMapping("/{movieId}")
    public ResponseEntity<?> getMovieDetailsWithRecommendations(
            @PathVariable int movieId
    ) {
        try {
            MovieDetailResponse response = movieService.getMovieDetails(movieId);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            logger.error("Error loading movie {}: {}", movieId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to load movie",
                            "movieId", movieId,
                            "detail", ex.getMessage()
                    ));
        }
    }


//    @GetMapping
//    public PagedMoviesResponse getAllMovies(
//            @RequestParam(defaultValue = "1") int page,
//            @RequestParam(defaultValue = "100") int perPage) {
//        return recommendationService.getAllMovies(page, perPage);
//    }




    // NEW
//    @GetMapping("/api/movies")
//    public PagedMoviesResponse getAllMovies(
//            @RequestParam(defaultValue = "1")   int page,
//            @RequestParam(defaultValue = "24")  int perPage
//    ) {
//        return recommendationService.getAllMovies(page, perPage);
//    }

    @GetMapping("api/movies")  // ← this maps to "/api/movies"
    public PagedMoviesResponse getAllMovies(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "per_page", defaultValue = "24") int perPage
    ) {
        return recommendationService.getAllMovies(page, perPage);
    }



    @GetMapping("/recommendations/collaborative/{userId}")
    public ResponseEntity<?> getCollaborativeRecommendations(
            @PathVariable int userId,
            @RequestParam(defaultValue = "30") int top_n) {
        try {
            return ResponseEntity.ok(recommendationService.getCollaborativeRecommendations(userId, top_n));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Recommendation failed", "detail", e.getMessage()));
        }
    }



    @GetMapping("/recommendations/watched/{userId}")
    public List<MovieDTO> getWatchedRecommendations(@PathVariable int userId,
                                                    @RequestParam(defaultValue = "10") int topN) {
        return recommendationService.getWatchedBasedRecommendations(userId, topN);
    }


    @Autowired
    private WatchedMovieRepository watchedRepo;




    @PostMapping("/{movieId}/rate")
    public ResponseEntity<?> rateMovie(
            @PathVariable Integer movieId,
            @RequestBody Map<String, Object> ratingRequest,
            Authentication authentication
    ) {
        try {
            String username = authentication.getName();
            AppUser user = appUserRepository.findByUsername(username);
            Double rating = Double.parseDouble(ratingRequest.get("rating").toString());

            RatingId ratingId = new RatingId();
            ratingId.setUserId(user.getId());
            ratingId.setMovieId(movieId);

            Rating userRating = ratingRepository.findById(ratingId).orElse(new Rating());
            userRating.setId(ratingId);
            userRating.setRating(rating);
            userRating.setTimestamp(LocalDateTime.now());

            ratingRepository.save(userRating);

            // Update average rating
            List<Rating> allRatings = ratingRepository.findById_MovieId(movieId);
            double avg = allRatings.stream()
                    .mapToDouble(Rating::getRating)
                    .average()
                    .orElse(0.0);

            return ResponseEntity.ok(Map.of(
                    "avg_rating", Math.round(avg * 10) / 10.0,
                    "num_ratings", allRatings.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Rating failed"));
        }
    }

    @GetMapping("/{movieId}/rating")
    public ResponseEntity<?> getUserRating(
            @PathVariable int movieId,
            Authentication authentication
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String username = authentication.getName();
            AppUser user = appUserRepository.findByUsername(username);
            Optional<Rating> rating = ratingRepository.findById(
                    new RatingId(user.getId(), movieId)
            );

            return rating.map(r -> ResponseEntity.ok(r.getRating()))
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Rating check failed"));
        }
    }


    @Autowired
    private ToWatchMovieRepository toWatchRepo;


    @Autowired
    private WatchedMovieRepository watchedMovieRepository;



    // Get watched list
    @GetMapping("/watched")
    public ResponseEntity<List<MovieDTO>> getWatchedList(
            @RequestParam int userId,
            Authentication authentication
    ) {
        if (!isAuthorized(userId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<WatchedMovie> watchedMovies = watchedRepo.findByUserId(userId);
        List<Integer> movieIds = watchedMovies.stream()
                .map(WatchedMovie::getMovieId)
                .collect(Collectors.toList());

        return ResponseEntity.ok(movieService.getMoviesByIds(movieIds));
    }

    // Remove from watched
    @DeleteMapping("/{movieId}/watched")
    public ResponseEntity<?> removeFromWatched(
            @PathVariable int movieId,
            @RequestParam int userId,
            Authentication authentication
    ) {
        if (!isAuthorized(userId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        watchedRepo.deleteByUserIdAndMovieId(userId, movieId);
        return ResponseEntity.noContent().build();
    }




    @PostMapping("/{movieId}/watched")
    public ResponseEntity<?> markMovieAsWatched(
            @PathVariable int movieId,
            @RequestParam int userId) {
        try {
            WatchedMovie saved = movieService.markAsWatched(userId, movieId);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Failed to mark as watched", "detail", e.getMessage()));
        }
    }

    @PostMapping("/{movieId}/to-watch")
    public ResponseEntity<?> markAsToWatch(
            @PathVariable int movieId,
            @RequestParam int userId) {
        try {
            ToWatchMovie saved = movieService.markAsToWatch(userId, movieId);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Failed to mark as to watch", "detail", e.getMessage()));
        }
    }



    // MovieController.java
    @GetMapping("/to-watch")
    public ResponseEntity<List<MovieDTO>> getToWatchList(
            @RequestParam int userId,
            Authentication authentication
    ) {
        if (!isAuthorized(userId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<ToWatchMovie> toWatchMovies = toWatchRepo.findByUserId(userId);
        List<Integer> movieIds = toWatchMovies.stream()
                .map(ToWatchMovie::getMovieId)
                .collect(Collectors.toList());

        List<MovieDTO> movies = movieService.getMoviesByIds(movieIds);
        return ResponseEntity.ok(movies);
    }



    @DeleteMapping("/{movieId}/to-watch")
    public ResponseEntity<?> removeFromToWatch(
            @PathVariable int movieId,
            @RequestParam int userId,
            Authentication authentication
    ) {
        if (!isAuthorized(userId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        toWatchRepo.deleteByUserIdAndMovieId(userId, movieId);
        return ResponseEntity.noContent().build();
    }

    private boolean isAuthorized(int userId, Authentication authentication) {
        String currentUsername = authentication.getName();
        AppUser currentUser = appUserRepository.findByUsername(currentUsername);
        return currentUser != null && currentUser.getId() == userId;
    }




    @DeleteMapping("/api/movies/watched")
    public ResponseEntity<?> deleteWatched(@RequestParam int userId, @RequestParam int movieId) {
        movieService.removeFromWatchedList(userId, movieId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/api/movies/to-watch")
    public ResponseEntity<?> deleteToWatch(@RequestParam int userId, @RequestParam int movieId) {
        movieService.removeFromToWatchList(userId, movieId);
        return ResponseEntity.ok().build();
    }



    // MovieController.java
    @GetMapping("/search")
    public PagedMoviesResponse searchMovies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) List<String> genres,
            @RequestParam(required = false) Integer yearFrom,
            @RequestParam(required = false) Integer yearTo,
            @RequestParam(required = false) Double ratingFrom,
            @RequestParam(required = false) Double ratingTo,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int perPage
    ) {
        return movieService.searchMovies(
                title, genres, yearFrom, yearTo, ratingFrom, ratingTo, page, perPage);
    }




}

