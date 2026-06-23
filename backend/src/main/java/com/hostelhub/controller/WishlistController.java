package com.hostelhub.controller;

import com.hostelhub.dto.ProductResponse;
import com.hostelhub.model.Product;
import com.hostelhub.model.User;
import com.hostelhub.model.WishlistItem;
import com.hostelhub.repository.ProductRepository;
import com.hostelhub.repository.UserRepository;
import com.hostelhub.repository.WishlistRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistController(WishlistRepository wishlistRepository, UserRepository userRepository,
                              ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    // 1. Get current user's wishlist
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getMyWishlist(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<WishlistItem> wishlistItems = wishlistRepository.findByUser(user);
        List<ProductResponse> wishlistProducts = wishlistItems.stream()
                .map(item -> new ProductResponse(item.getProduct()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(wishlistProducts);
    }

    // 2. Add product to wishlist
    @PostMapping("/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long productId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (wishlistRepository.existsByUserAndProduct(user, product)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product is already in wishlist"));
        }

        WishlistItem item = new WishlistItem(user, product);
        wishlistRepository.save(item);

        return ResponseEntity.ok(Map.of("message", "Product added to wishlist successfully"));
    }

    // 3. Remove product from wishlist
    @DeleteMapping("/{productId}")
    @Transactional
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long productId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!wishlistRepository.existsByUserAndProduct(user, product)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product is not in wishlist"));
        }

        wishlistRepository.deleteByUserAndProduct(user, product);

        return ResponseEntity.ok(Map.of("message", "Product removed from wishlist successfully"));
    }

    // 4. Check if product is in wishlist
    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkWishlist(@PathVariable Long productId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        boolean isWishlisted = wishlistRepository.existsByUserAndProduct(user, product);
        return ResponseEntity.ok(Map.of("isWishlisted", isWishlisted));
    }
}
