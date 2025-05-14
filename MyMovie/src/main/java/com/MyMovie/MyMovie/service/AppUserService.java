package com.MyMovie.MyMovie.service;


import com.MyMovie.MyMovie.dao.dto.UpdateProfileDto;
import com.MyMovie.MyMovie.dao.entities.AppUser;
import com.MyMovie.MyMovie.dao.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class AppUserService implements UserDetailsService {

    @Autowired
    private AppUserRepository appUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser appUser = appUserRepository.findByUsername(username);
        if (appUser != null) {
            var springUser = User.withUsername(appUser.getUsername())
                    .password(appUser.getPassword())
                    .roles(appUser.getRole())
                    .build();
            return springUser;
        }

        return null;
    }




    public AppUser updateProfile(int userId, UpdateProfileDto dto) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());

        if (dto.getProfilePicture() != null && !dto.getProfilePicture().isEmpty()) {
            // e.g., save to local disk or cloud storage
            String filename = storeProfileImage(dto.getProfilePicture());
            user.setProfilePictureUrl("/images/profiles/" + filename);
        }

        return appUserRepository.save(user);
    }

    private String storeProfileImage(MultipartFile file) {
        // 1) Normalize original filename
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        // 2) Generate a random filename
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot > 0) ext = original.substring(dot);
        String filename = UUID.randomUUID().toString() + ext;

        // 3) Prepare upload directory
        Path uploadDir = Paths.get("uploads/profiles");
        try {
            if (Files.notExists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // 4) Copy file to target location (overwriting if exists)
            Path targetPath = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + filename, e);
        }
    }
}
