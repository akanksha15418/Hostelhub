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

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use!"));
        }

        if (userRepository.existsByPhone(registerRequest.getPhone())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is already in use!"));
        }

        // Create new user's account
        User user = new User(
                registerRequest.getName(),
                registerRequest.getEmail(),
                registerRequest.getPhone(),
                registerRequest.getHostel(),
                passwordEncoder.encode(registerRequest.getPassword())
        );

        userRepository.save(user);

        // Auto-login after registration by generating token
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
        // Authenticate using AuthenticationManager
        // Under the hood, loadUserByUsername supports either email or phone
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmailOrPhone(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Find user by email or phone to return user details
        User user = userRepository.findByEmailOrPhone(loginRequest.getEmailOrPhone(), loginRequest.getEmailOrPhone())
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
