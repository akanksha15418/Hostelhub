package com.hostelhub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = new File(uploadDir).getAbsolutePath();
        
        // Ensure path ends with slash
        if (!absolutePath.endsWith(File.separator)) {
            absolutePath += File.separator;
        }
        
        // Convert Windows backslashes to forward slashes for URLs
        String resourceLocation = "file:" + absolutePath.replace("\\", "/");
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation);
                
        System.out.println("Static resource handler mapping: /uploads/** -> " + resourceLocation);
    }
}
