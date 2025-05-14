package com.MyMovie.MyMovie.dao.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter @Setter
public class UpdateProfileDto {

    @NotEmpty(message = "First name is required")
    private String firstName;

    @NotEmpty(message = "Last name is required")
    private String lastName;

    @NotEmpty @Email(message = "Must be a valid email")
    private String email;

    // e.g. 10 digits, optional “+” country code
    @Pattern(
            regexp = "^(\\+\\d{1,3}[- ]?)?\\d{10}$",
            message = "Phone must be 10 digits, optionally prefixed by +countryCode"
    )
    private String phone;

    @Size(max = 200, message = "Address cannot exceed 200 characters")
    private String address;

    // will be null if user didn’t choose a new picture
    private MultipartFile profilePicture;
}
