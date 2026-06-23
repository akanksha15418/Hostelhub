package com.hostelhub.controller;

import com.hostelhub.dto.ProductResponse;
import com.hostelhub.model.Product;
import com.hostelhub.model.User;
import com.hostelhub.repository.ProductRepository;
import com.hostelhub.repository.UserRepository;
import com.hostelhub.service.ImageUploadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ImageUploadService imageUploadService;

    public ProductController(ProductRepository productRepository, UserRepository userRepository,
                             ImageUploadService imageUploadService) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.imageUploadService = imageUploadService;
    }

    // 1. Get all available products with optional category and search filters
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        
        // Handle empty strings as null
        String catFilter = (category == null || category.trim().isEmpty()) ? null : category.trim().toLowerCase();
        String searchFilter = (search == null || search.trim().isEmpty()) ? null : "%" + search.trim().toLowerCase() + "%";

        List<Product> products = productRepository.searchProducts(catFilter, searchFilter);
        List<ProductResponse> response = products.stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    // 2. Get product details by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return ResponseEntity.ok(new ProductResponse(product));
    }

    // 3. Add a new product (Multipart form data)
    @PostMapping
    public ResponseEntity<?> addProduct(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("category") String category,
            @RequestParam("condition") String condition,
            @RequestParam("image") MultipartFile imageFile,
            Principal principal) {

        try {
            User seller = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Seller not found"));

            String imageUrl = imageUploadService.uploadImage(imageFile);

            Product product = new Product(title, description, price, category, condition, imageUrl, seller);
            Product savedProduct = productRepository.save(product);

            return ResponseEntity.status(HttpStatus.CREATED).body(new ProductResponse(savedProduct));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload image: " + e.getMessage()));
        }
    }

    // 4. Update an existing product
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("category") String category,
            @RequestParam("condition") String condition,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            Principal principal) {

        try {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            User currentUser = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if current user is the owner
            if (!product.getSeller().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You are not authorized to update this listing"));
            }

            product.setTitle(title);
            product.setDescription(description);
            product.setPrice(price);
            product.setCategory(category);
            product.setCondition(condition);
            product.setHostel(currentUser.getHostel());

            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = imageUploadService.uploadImage(imageFile);
                product.setImageUrl(imageUrl);
            }

            Product updatedProduct = productRepository.save(product);
            return ResponseEntity.ok(new ProductResponse(updatedProduct));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload image: " + e.getMessage()));
        }
    }

    // 5. Delete a product
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, Principal principal) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check ownership
        if (!product.getSeller().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You are not authorized to delete this listing"));
        }

        productRepository.delete(product);
        return ResponseEntity.ok(Map.of("message", "Listing deleted successfully"));
    }

    // 6. Update product status (Mark as Sold / Available)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateProductStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            Principal principal) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check ownership
        if (!product.getSeller().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You are not authorized to edit this listing"));
        }

        String targetStatus = status.toUpperCase();
        if (!targetStatus.equals("AVAILABLE") && !targetStatus.equals("SOLD")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status value"));
        }

        product.setStatus(targetStatus);
        Product updatedProduct = productRepository.save(product);
        return ResponseEntity.ok(new ProductResponse(updatedProduct));
    }
}
