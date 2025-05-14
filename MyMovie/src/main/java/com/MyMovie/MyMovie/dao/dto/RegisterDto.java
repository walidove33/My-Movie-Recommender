//package com.MyMovie.MyMovie.dao.dto;
//
//
//
//
//import jakarta.validation.constraints.NotEmpty;
//import jakarta.validation.constraints.Size;
//import lombok.Getter;
//import lombok.Setter;
//
//
//@Getter @Setter
//public class RegisterDto {
//
//    @NotEmpty
//    private String firstName;
//    @NotEmpty
//    private String lastName;
//    @NotEmpty
//    private String username;
//    @NotEmpty
//    private String email;
//    @NotEmpty
//    @Size(min = 6, message = "Password must be at least 6 characters long")
//    private String password;
//
//
//    private String phone;
//
//    private String address;
//}
package com.MyMovie.MyMovie.dao.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RegisterDto {

    @NotEmpty(message = "First name is required")
    @Size(max = 50)
    private String firstName;

    @NotEmpty(message = "Last name is required")
    @Size(max = 50)
    private String lastName;

    @NotEmpty(message = "Username is required")
    @Size(min = 4, max = 20, message = "Username must be 4–20 characters")
    private String username;

    @NotEmpty(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotEmpty(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    @Pattern(
            regexp = "^(0\\d{9}|\\+\\d{12})$",
            message = "Phone must either start with 0 and be 10 digits total, or start with + and be followed by 12 digits"
    )
    private String phone;

    @Size(max = 200, message = "Address cannot exceed 200 characters")
    private String address;
}
