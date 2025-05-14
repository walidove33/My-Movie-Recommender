package com.MyMovie.MyMovie.dao.repository;


import com.MyMovie.MyMovie.dao.entities.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Integer> , JpaSpecificationExecutor<Movie> {
    List<Movie> findByTitleContainingIgnoreCase(String title);


}

