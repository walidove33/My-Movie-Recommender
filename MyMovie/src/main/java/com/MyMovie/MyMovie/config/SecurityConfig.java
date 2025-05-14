//
//
//
//package com.MyMovie.MyMovie.config;
//
//import com.MyMovie.MyMovie.service.AppUserService;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpMethod;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.ProviderManager;
//import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
//import org.springframework.security.config.Customizer;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
//import org.springframework.security.oauth2.jwt.JwtDecoder;
//import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
//import org.springframework.security.web.AuthenticationEntryPoint;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//
//import javax.crypto.spec.SecretKeySpec;
//import java.util.Arrays;
//
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity(prePostEnabled = true)
//public class SecurityConfig {
//
//    private final AppUserService appUserService;
//
//    @Value("${security.jwt.secret}")
//    private String jwtSecretKey;
//
//    public SecurityConfig(AppUserService appUserService) {
//        this.appUserService = appUserService;
//    }
//
//    /**
//     * Send 401 on any authentication failure (expired/invalid token, etc.)
//     */
//    @Bean
//    public AuthenticationEntryPoint jwtAuthEntryPoint() {
//        return (request, response, authException) ->
//                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, authException.getMessage());
//    }
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                // 1) Disable CSRF, enable CORS
//                .csrf(csrf -> csrf.disable())
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//
//                // 2) Stateless session & exception handling
//                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthEntryPoint()))
//
//                // 3) URL authorization rules
//                .authorizeHttpRequests(auth -> auth
//                        // allow all preflight calls
//                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//
//                        // public: root and account endpoints
//                        .requestMatchers("/", "/account/**").permitAll()
//
//                        // admin only
//                        .requestMatchers("/admin/**").hasRole("ADMIN")
//
//                        // all /api/** require authentication
//                        .requestMatchers("/api/**").authenticated()
//
//                        // any other endpoint also requires auth
//                        .anyRequest().authenticated()
//                )
//
//                // 4) Configure built-in JWT support
//                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
//
//        return http.build();
//    }
//
//    /**
//     * Decode and verify incoming JWTs using your shared secret
//     */
//    @Bean
//    public JwtDecoder jwtDecoder() {
////        var key = new SecretKeySpec(jwtSecretKey.getBytes(), "");
//        var key = new SecretKeySpec(jwtSecretKey.getBytes(), "HmacSHA256");
//
//        return NimbusJwtDecoder
//                .withSecretKey(key)
//                .macAlgorithm(MacAlgorithm.HS256)
//                .build();
//    }
//
//    /**
//     * AuthenticationManager backed by your AppUserService + BCrypt
//     */
//    @Bean
//    public AuthenticationManager authenticationManager() {
//        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
//        provider.setUserDetailsService(appUserService);
//        provider.setPasswordEncoder(passwordEncoder());
//        return new ProviderManager(provider);
//    }
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//    /**
//     * CORS setup for Angular dev at localhost:4200
//     */
//    @Bean
//    CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration config = new CorsConfiguration();
//        config.setAllowedOrigins(Arrays.asList(
//                "http://localhost:4200",
//                "http://127.0.0.1:4200"
//        ));
//        config.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS"));
//        config.setAllowedHeaders(Arrays.asList("Authorization","Content-Type"));
//        config.setExposedHeaders(Arrays.asList("X-RateLimit-Limit","X-RateLimit-Remaining"));
//        config.setAllowCredentials(true);
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", config);
//        return source;
//    }
//}

package com.MyMovie.MyMovie.config;

import com.MyMovie.MyMovie.service.AppUserService;
import io.jsonwebtoken.io.Decoders;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final AppUserService appUserService;

    @Value("${security.jwt.secret}")
    private String jwtSecretKey;

    public SecurityConfig(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @Bean
    public AuthenticationEntryPoint jwtAuthEntryPoint() {
        return (req, res, ex) ->
                res.sendError(HttpServletResponse.SC_UNAUTHORIZED, ex.getMessage());
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthEntryPoint()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/", "/account/**").permitAll()
                        .requestMatchers("/images/profiles/**").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        byte[] secret = Decoders.BASE64.decode(jwtSecretKey);
        var key = new SecretKeySpec(secret, "HmacSHA256");
        return NimbusJwtDecoder
                .withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        var provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(appUserService);
        provider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(provider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        config.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization","Content-Type"));
        config.setAllowCredentials(true);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
