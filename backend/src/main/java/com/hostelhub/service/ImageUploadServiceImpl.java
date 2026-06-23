package com.hostelhub.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class ImageUploadServiceImpl implements ImageUploadService {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${app.backend-url:http://localhost:8080}")
    private String backendUrl;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    private Cloudinary cloudinary;
    private boolean useCloudinary = false;

    @PostConstruct
    public void init() {
        if (cloudName != null && !cloudName.isEmpty() &&
            apiKey != null && !apiKey.isEmpty() &&
            apiSecret != null && !apiSecret.isEmpty()) {
            
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
            ));
            useCloudinary = true;
            System.out.println("Cloudinary initialized successfully. Using Cloudinary for image storage.");
        } else {
            System.out.println("Cloudinary credentials not provided. Falling back to local storage in directory: " + uploadDir);
            try {
                Path path = Paths.get(uploadDir);
                if (!Files.exists(path)) {
                    Files.createDirectories(path);
                }
            } catch (IOException e) {
                System.err.println("Failed to create upload directory: " + e.getMessage());
            }
        }
    }

    @Override
    public String uploadImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        if (useCloudinary) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
                return (String) uploadResult.get("secure_url");
            } catch (Exception e) {
                System.err.println("Cloudinary upload failed: " + e.getMessage() + ". Falling back to local upload.");
            }
        }

        // Local Upload Fallback
        Path path = Paths.get(uploadDir);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String filename = UUID.randomUUID().toString() + extension;
        Path targetPath = path.resolve(filename);
        
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        return backendUrl + "/uploads/" + filename;
    }
}
