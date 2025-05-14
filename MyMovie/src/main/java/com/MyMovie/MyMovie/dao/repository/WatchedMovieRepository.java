package com.MyMovie.MyMovie.dao.repository;

// src/main/java/com/MyMovie/MyMovie/repository/WatchedMovieRepository.java

import com.MyMovie.MyMovie.dao.entities.WatchedMovie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WatchedMovieRepository extends JpaRepository<WatchedMovie, Long> {
    void deleteByUserIdAndMovieId(int userId, int movieId);

    boolean existsByUserIdAndMovieId(int userId, int movieId);

    Optional<WatchedMovie> findByUserIdAndMovieId(int userId, int movieId);


    List<WatchedMovie> findByUserId(int userId);
}


