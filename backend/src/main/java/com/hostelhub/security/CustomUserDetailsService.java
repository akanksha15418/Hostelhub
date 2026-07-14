package com.hostelhub.security;

import com.hostelhub.model.User;
import com.hostelhub.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Normalize phone to last 10 digits (handles leading zeros, country codes).
     */
    private String normalizePhone(String input) {
        String digits = input.replaceAll("\\D", "");
        if (digits.length() > 10) {
            digits = digits.substring(digits.length() - 10);
        }
        return digits;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Normalize: if it looks like a phone, take last 10 digits; else lowercase email
        String digitsOnly = username.replaceAll("\\D", "");
        boolean looksLikePhone = username.matches("[+0-9 \\-().]+") && digitsOnly.length() >= 8;
        String lookupKey = looksLikePhone ? normalizePhone(username) : username.toLowerCase();

        User user = userRepository.findByEmailOrPhone(lookupKey, lookupKey)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return new org.springframework.security.core.userdetails.User(
                lookupKey, // Use same lookupKey so Spring Security username check passes
                user.getPassword(),
                new ArrayList<>()
        );
    }
}
