package com.hostelhub.controller;

import com.hostelhub.dto.AuthResponse;
import com.hostelhub.dto.LoginRequest;
import com.hostelhub.dto.RegisterRequest;
import com.hostelhub.model.User;
import com.hostelhub.repository.UserRepository;
import com.hostelhub.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                          PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Normalizes a phone number to its last 10 digits.
     * Handles leading zeros (08960740267 → 8960740267)
     * and country codes (+918960740267 → 8960740267).
     */
    private String normalizePhone(String phone) {
        if (phone == null) return null;
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() > 10) {
            digits = digits.substring(digits.length() - 10);
        }
        return digits;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        String normalizedEmail = registerRequest.getEmail().trim().toLowerCase();
        String normalizedPhone = normalizePhone(registerRequest.getPhone());

        if (normalizedPhone == null || normalizedPhone.length() != 10) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number must be exactly 10 digits."));
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use!"));
        }

        if (userRepository.existsByPhone(normalizedPhone)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is already in use!"));
        }

        // Create new user's account with normalized data
        User user = new User(
                registerRequest.getName().trim(),
                normalizedEmail,
                normalizedPhone,
                registerRequest.getHostel().trim(),
                passwordEncoder.encode(registerRequest.getPassword())
        );

        userRepository.save(user);

        String jwt = jwtUtils.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getHostel()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        String input = loginRequest.getEmailOrPhone().trim();

        // Detect if input looks like a phone number (digits, +, spaces, dashes)
        String digitsOnly = input.replaceAll("\\D", "");
        boolean looksLikePhone = input.matches("[+0-9 \\-().]+") && digitsOnly.length() >= 8;

        String lookupKey;
        if (looksLikePhone) {
            lookupKey = normalizePhone(input); // last 10 digits
        } else {
            lookupKey = input.toLowerCase();   // normalize email case
        }

        // Authenticate using AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(lookupKey, loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Find user by normalized email or phone
        User user = userRepository.findByEmailOrPhone(lookupKey, lookupKey)
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

        String jwt = jwtUtils.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getHostel()
        ));
    }
}
