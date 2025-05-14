//package com.MyMovie.MyMovie.dao.dto;
//
//import lombok.*;
//
//import java.util.List;
//
//@Getter
//@Setter
//@NoArgsConstructor
//public class PagedMoviesResponse {
//    private int page;
//    private int perPage;
//    private Long totalMovies;
//    private List<MovieDTO> results;  // Changed from List<Object>
//
//    // Add empty results constructor
//    public PagedMoviesResponse(int page, int perPage, Long totalMovies , List<MovieDTO> results) {
//        this.page = page;
//        this.perPage = perPage;
//        this.totalMovies = totalMovies;
//        this.results = results;
//
//    }
//
//
//    public static PagedMoviesResponse of(
//            int page, int perPage, long total, List<MovieDTO> results
//    ) {
//        return new PagedMoviesResponse(page, perPage, total, results);
//    }
//}

package com.MyMovie.MyMovie.dao.dto;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PagedMoviesResponse {
    private int page;

    @JsonProperty("per_page")
    private int perPage;

    @JsonProperty("total_movies")
    private Long totalMovies;

    private List<MovieDTO> results;

    public PagedMoviesResponse(int page, int perPage, Long totalMovies, List<MovieDTO> results) {
        this.page = page;
        this.perPage = perPage;
        this.totalMovies = totalMovies;
        this.results = results;
    }

    public static PagedMoviesResponse of(int page, int perPage, long total, List<MovieDTO> results) {
        return new PagedMoviesResponse(page, perPage, total, results);
    }
}
