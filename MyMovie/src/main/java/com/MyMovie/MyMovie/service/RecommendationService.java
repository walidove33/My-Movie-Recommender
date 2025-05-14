package com.MyMovie.MyMovie.service;


import com.MyMovie.MyMovie.dao.dto.MovieDTO;
import com.MyMovie.MyMovie.dao.dto.MovieDetailResponse;
import com.MyMovie.MyMovie.dao.dto.PagedMoviesResponse;
import com.MyMovie.MyMovie.dao.entities.Movie;
import com.MyMovie.MyMovie.dao.entities.Rating;
import com.MyMovie.MyMovie.dao.entities.ToWatchMovie;
import com.MyMovie.MyMovie.dao.entities.WatchedMovie;
import com.MyMovie.MyMovie.dao.repository.MovieRepository;
import com.MyMovie.MyMovie.dao.repository.RatingRepository;
import com.MyMovie.MyMovie.dao.repository.ToWatchMovieRepository;
import com.MyMovie.MyMovie.dao.repository.WatchedMovieRepository;
import com.MyMovie.MyMovie.exception.NotFoundException;
import jakarta.persistence.criteria.Predicate;
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
public class RecommendationService {

    private final RatingRepository ratingRepository;

    private final String flaskBaseUrl;

    @Autowired
    private MovieRepository movieRepository;
    private final RestTemplate restTemplate;


    private static final Logger logger = LoggerFactory.getLogger(RecommendationService.class);

    public RecommendationService(RestTemplateBuilder restTemplateBuilder,
                                 @Value("${flask.api.base-url}") String flaskBaseUrl , RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
        this.restTemplate = restTemplateBuilder.build();
        this.flaskBaseUrl = flaskBaseUrl;
    }




    public List<MovieDTO> getHybridRecommendations(int userId, int topN) {
        String url = String.format("%s/api/recommendations/hybrid/%d?top_n=%d",
                flaskBaseUrl, userId, topN);
        return Arrays.asList(restTemplate.getForObject(url, MovieDTO[].class));
    }


    public List<MovieDTO> getWatchedBasedRecommendations(int userId, int topN) {
        String url = String.format("%s/api/recommendations/watched/%d?top_n=%d",
                flaskBaseUrl, userId, topN);

        List<WatchedMovie> watchedMovies = watchedRepo.findByUserId(userId);
        Set<Integer> watchedIds = watchedMovies.stream()
                .map(WatchedMovie::getMovieId)
                .collect(Collectors.toSet());

        List<Integer> ratedIds = ratingRepository.findById_UserId(userId)
                .stream()
                .map(r -> r.getId().getMovieId())
                .toList();

        Set<Integer> excludedIds = new HashSet<>();
        excludedIds.addAll(watchedIds);
        excludedIds.addAll(ratedIds);

        try {
            List<MovieDTO> recommendations = Arrays.asList(
                    restTemplate.getForObject(url, MovieDTO[].class)
            );

            return recommendations.stream()
                    .filter(m -> !excludedIds.contains(m.getMovieId()))
                    .limit(topN)
                    .toList();

        } catch (RestClientException e) {
            logger.error("Failed to get watched-based recommendations for userId {}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }









    public List<MovieDTO> getTopRated(int minRatings) {
        String url = String.format("%s/api/recommendations/top-rated?min_ratings=%d",
                flaskBaseUrl, minRatings);
        return Arrays.asList(restTemplate.getForObject(url, MovieDTO[].class));
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

//    public PagedMoviesResponse getAllMovies(int page, int perPage) {
//        String url = String.format(
//                "%s/api/movies?page=%d&per_page=%d",
//                flaskBaseUrl, page, perPage
//        );
//        return restTemplate.getForObject(url, PagedMoviesResponse.class);
//    }

    public PagedMoviesResponse getAllMovies(int page, int perPage) {
        String url = String.format(
                "%s/api/movies?page=%d&per_page=%d",
                flaskBaseUrl, page, perPage
        );
        // Deserializes directly into your PagedMoviesResponse DTO
        return restTemplate.getForObject(url, PagedMoviesResponse.class);
    }




//
//    public PagedMoviesResponse getAllMovies(int page, int perPage) {
//        String url = String.format("%s/api/movies?page=%d&per_page=%d",
//                flaskBaseUrl, page, perPage);
//        return restTemplate.getForObject(url, PagedMoviesResponse.class);
//    }


    @Autowired
    private WatchedMovieRepository watchedRepo;


    public List<MovieDTO> getCollaborativeRecommendations(int userId, int topN) {
        // Get rated movie IDs first

        String url = String.format("%s/api/recommendations/collaborative/%d?top_n=%d",
                flaskBaseUrl, userId, topN);
        List<WatchedMovie> watchedMovies = watchedRepo.findByUserId(userId);
        Set<Integer> watchedIds = watchedMovies.stream()
                .map(WatchedMovie::getMovieId)
                .collect(Collectors.toSet());

        // Get rated movies (existing logic)
        List<Integer> ratedIds = ratingRepository.findById_UserId(userId)
                .stream()
                .map(r -> r.getId().getMovieId())
                .toList();

        // Combine exclusions
        Set<Integer> excludedIds = new HashSet<>();
        excludedIds.addAll(watchedIds);
        excludedIds.addAll(ratedIds);

        // Get recommendations from Flask
        List<MovieDTO> recommendations = Arrays.asList(
                restTemplate.getForObject(url, MovieDTO[].class)
        );

        return recommendations.stream()
                .filter(m -> !excludedIds.contains(m.getMovieId()))
                .limit(topN)
                .toList();
    }














}




