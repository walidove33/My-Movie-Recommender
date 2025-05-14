package com.MyMovie.MyMovie.dao.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter  @Setter
@NoArgsConstructor @AllArgsConstructor
//@Table(name = "users")
//public class AppUser {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private int id;
//
//    private String firstName;
//    private String lastName;
//
//    @Column(unique = true)
//    private String username;
//
//    @Column(unique = true)
//    private String email ;
//
//    private String phone ;
//    private String address ;
//    private String password ;
//    private String role ;
//
//    private Date createdAt;
//}


@Table(name = "users")
public class AppUser {
    @Id @GeneratedValue
    private Integer id;
    private String firstName;
    private String lastName;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    private String phone;
    private String address;

    private String password;
    private String role;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    // new: store a URL or filename for the profile picture
    private String profilePictureUrl;

}
