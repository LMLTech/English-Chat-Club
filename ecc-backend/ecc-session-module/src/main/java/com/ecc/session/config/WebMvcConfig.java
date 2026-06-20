package com.ecc.session.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Ánh xạ thư mục vật lý chứa file ghi âm ra đường dẫn URL web
        // Chuỗi "file:uploads/voices/" là đường dẫn vật lý trên máy tính
        registry.addResourceHandler("/files/voices/**")
                .addResourceLocations("file:uploads/voices/");
    }
}