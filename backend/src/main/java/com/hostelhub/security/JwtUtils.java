package com.hostelhub.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    private final Key key;
    private final int jwtExpirationMs;

    public JwtUtils(
            @Value("${app.jwt-secret:defaultSecretKeyWithAtLeast32CharactersLong!}") String jwtSecret,
            @Value("${app.jwt-expiration-ms:86400000}") int jwtExpirationMs) {
        
        // Ensure secret is at least 256 bits (32 bytes)
        byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            byte[] paddedBytes = new byte[32];
            System.arraycopy(secretBytes, 0, paddedBytes, 0, Math.min(secretBytes.length, 32));
            this.key = Keys.hmacShaKeyFor(paddedBytes);
        } else {
            this.key = Keys.hmacShaKeyFor(secretBytes);
        }
        this.jwtExpirationMs = jwtExpirationMs;
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        }
        return false;
    }
}
