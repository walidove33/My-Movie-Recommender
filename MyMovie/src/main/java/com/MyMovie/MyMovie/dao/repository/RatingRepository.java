//package com.MyMovie.MyMovie.dao.repository;
//
//import com.MyMovie.MyMovie.dao.embeddable.RatingId;
//import com.MyMovie.MyMovie.dao.entities.Rating;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//
//import java.util.List;
//
//public interface RatingRepository extends JpaRepository<Rating, RatingId> {
//    List<Rating> findById_UserId(Integer userId);
//    List<Rating> findById_MovieId(Integer movieId);
//
//
//    interface RatingStats {
//        Integer getMovieId();
//        Integer getNumRatings();
//        Double getAvgRating();
//    }
//
//    @Query("SELECT r.id.movieId AS movieId, COUNT(r) AS numRatings, AVG(r.rating) AS avgRating " +
//            "FROM Rating r GROUP BY r.id.movieId HAVING r.id.movieId = :movieId")
//    RatingStats findStatsByMovieId(@Param("movieId") int movieId);
//
//
//
//
//}
//



package com.MyMovie.MyMovie.dao.repository;

import com.MyMovie.MyMovie.dao.embeddable.RatingId;
import com.MyMovie.MyMovie.dao.entities.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, RatingId> {

    List<Rating> findById_UserId(Integer userId);
    List<Rating> findById_MovieId(Integer movieId);

    interface RatingStats {
        Integer getMovieId();
        Integer getNumRatings();
        Double getAvgRating();
    }

    @Query("""
        SELECT r.id.movieId AS movieId,
               COUNT(r)        AS numRatings,
               AVG(r.rating)   AS avgRating
          FROM Rating r
         WHERE r.id.movieId = :movieId
         GROUP BY r.id.movieId
    """)
    RatingStats findStatsByMovieId(@Param("movieId") int movieId);

    /**
     * Renvoie la liste des movieId dont la note moyenne est
     * comprise entre :from et :to (inclus).
     */
    @Query("""
        SELECT r.id.movieId
          FROM Rating r
      GROUP BY r.id.movieId
        HAVING AVG(r.rating) BETWEEN :from AND :to
    """)
    List<Integer> findMovieIdsByAvgRatingBetween(
            @Param("from") double from,
            @Param("to")   double to
    );
}
