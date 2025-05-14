package com.MyMovie.MyMovie.web;

import com.MyMovie.MyMovie.dao.dto.UpdateProfileDto;
import com.MyMovie.MyMovie.dao.entities.AppUser;
import com.MyMovie.MyMovie.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /** 1) DASHBOARD **/
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Long>> dashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    /** 2) USER MANAGEMENT **/
    @GetMapping("/users")
    public ResponseEntity<List<AppUser>> listUsers() {
        return ResponseEntity.ok(adminService.listAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping(value = "/users/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<AppUser> updateUser(
            @PathVariable Integer id,
            @Valid @ModelAttribute UpdateProfileDto dto,
            @RequestPart(required = false) MultipartFile profilePicture
    ) {
        AppUser updated = adminService.updateUserProfile(id, dto, profilePicture);
        return ResponseEntity.ok(updated);
    }

    /** 3) MOVIE MANAGEMENT **/
    @GetMapping("/movies")
    public ResponseEntity<List<Object>> listMovies() {
        return ResponseEntity.ok(adminService.listAllMovies());
    }

    @DeleteMapping("/movies/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Integer id) {
        adminService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }
}
