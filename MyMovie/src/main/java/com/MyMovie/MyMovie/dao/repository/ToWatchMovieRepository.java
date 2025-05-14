package com.MyMovie.MyMovie.dao.repository;

// src/main/java/com/MyMovie/MyMovie/repository/ToWatchMovieRepository.java

import com.MyMovie.MyMovie.dao.entities.ToWatchMovie;
import com.MyMovie.MyMovie.dao.entities.WatchedMovie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ToWatchMovieRepository extends JpaRepository<ToWatchMovie, Long> {
    void deleteByUserIdAndMovieId(int userId, int movieId);
    boolean existsByUserIdAndMovieId(int userId, int movieId);
    Optional<ToWatchMovie> findByUserIdAndMovieId(int userId, int movieId);

    List<ToWatchMovie> findByUserId(int userId);
}
