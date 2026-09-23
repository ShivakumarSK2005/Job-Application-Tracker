package com.jobtracker.security;

import com.jobtracker.service.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getServletPath().startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // No Authorization header
        if (authHeader == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Authorization header exists but is not Bearer
        if (!authHeader.startsWith("Bearer ")) {
            sendError(
                    response,
                    "Invalid Authorization header."
            );
            return;
        }

        String token = authHeader.substring(7);

        try {

            String email = jwtService.extractEmail(token);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            Collections.emptyList()
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException exception) {

            SecurityContextHolder.clearContext();

            sendError(
                    response,
                    "JWT token has expired."
            );

        } catch (JwtException | IllegalArgumentException exception) {

            SecurityContextHolder.clearContext();

            sendError(
                    response,
                    "Invalid or malformed JWT token."
            );
        }
    }

    private void sendError(
            HttpServletResponse response,
            String message)
            throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");

        response.getWriter().write(
                "{\"message\":\"" + message + "\"}"
        );
    }
}

// What is happening?
// When you send:
// Authorization: Bearer eyJhbGci...

// the filter does:

// Authorization header
//         ↓
// Extract JWT
//         ↓
// Verify signature
//         ↓
// Extract email
//         ↓
// Create Authentication
//         ↓
// Spring Security knows the user




