package com.MyMovie.MyMovie.service;

import com.MyMovie.MyMovie.dao.dto.UpdateProfileDto;
import com.MyMovie.MyMovie.dao.entities.AppUser;
import com.MyMovie.MyMovie.dao.repository.AppUserRepository;
import com.MyMovie.MyMovie.dao.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final AppUserRepository userRepo;
    private final MovieRepository   movieRepo;
    private final AppUserService     userService;

    @Autowired
    public AdminService(
            AppUserRepository userRepo,
            MovieRepository movieRepo,
            AppUserService userService
    ) {
        this.userRepo    = userRepo;
        this.movieRepo   = movieRepo;
        this.userService = userService;
    }

    /** DASHBOARD STATS **/
    public Map<String, Long> getDashboardStats() {
        long totalUsers  = userRepo.count();
        long totalMovies = movieRepo.count();
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalMovies", totalMovies);
        return stats;
    }

    /** USERS **/
    public List<AppUser> listAllUsers() {
        return userRepo.findAll();
    }

    public void deleteUser(Integer userId) {
        userRepo.deleteById(userId);
    }

    public AppUser updateUserProfile(
            Integer userId,
            UpdateProfileDto dto,
            MultipartFile profilePicture
    ) {
        // reuse your existing updateProfile logic
        dto.setProfilePicture(profilePicture);
        return userService.updateProfile(userId, dto);
    }

    /** MOVIES **/
    public List<Object> listAllMovies() {
        // replace Object with your Movie entity class
        return Collections.singletonList(movieRepo.findAll());
    }

    public void deleteMovie(Integer movieId) {
        movieRepo.deleteById(movieId);
    }
}
