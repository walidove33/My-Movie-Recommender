package com.MyMovie.MyMovie.dao.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class MovieDetailResponse {
    private MovieDTO movie;
    private List<MovieDTO> recommendations;
}