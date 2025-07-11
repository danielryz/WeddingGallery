package com.weddinggallery.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/photos/**") // URL: /photos/nazwa.jpg
                .addResourceLocations("file:/Z:/WeddingGallery/weddinggallery/photos/"); // ścieżka do plików
    }
}