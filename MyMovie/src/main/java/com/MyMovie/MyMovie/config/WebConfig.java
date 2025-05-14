package com.MyMovie.MyMovie.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map "/images/profiles/**" to "file:uploads/profiles/"
        registry.addResourceHandler("/images/profiles/**")
                .addResourceLocations("file:uploads/profiles/");
    }
}
