package com.hostelhub.controller;

import com.hostelhub.dto.ProductResponse;
import com.hostelhub.dto.UpdateProfileRequest;
import com.hostelhub.model.Product;
import com.hostelhub.model.User;
import com.hostelhub.repository.ProductRepository;
import com.hostelhub.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public UserController(UserRepository userRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    // 1. Get profile details of the current logged-in user
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Return user info excluding password
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "hostel", user.getHostel(),
                "createdAt", user.getCreatedAt()
        ));
    }

    // 2. Get listings of the current logged-in user (includes sold products too)
    @GetMapping("/me/listings")
    public ResponseEntity<List<ProductResponse>> getMyListings(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Product> products = productRepository.findBySellerOrderByCreatedAtDesc(user);
        List<ProductResponse> response = products.stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 3. Update current user's profile info
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if phone number is being changed and is already taken by someone else
        if (!user.getPhone().equals(request.getPhone()) && userRepository.existsByPhone(request.getPhone())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is already in use!"));
        }

        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setHostel(request.getHostel());

        User updatedUser = userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "id", updatedUser.getId(),
                "name", updatedUser.getName(),
                "email", updatedUser.getEmail(),
                "phone", updatedUser.getPhone(),
                "hostel", updatedUser.getHostel(),
                "createdAt", updatedUser.getCreatedAt()
        ));
    }
}
