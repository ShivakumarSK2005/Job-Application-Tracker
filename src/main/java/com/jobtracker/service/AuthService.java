package com.jobtracker.service;

import com.jobtracker.dto.UserRequest;
import com.jobtracker.dto.UserResponse;
import com.jobtracker.model.User;
import com.jobtracker.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
// checking email already exists exception
import com.jobtracker.exception.EmailAlreadyExistsException;
import com.jobtracker.exception.InvalidCredentialsException;

// DTO logIn Request
import com.jobtracker.dto.LoginRequest;
// DTO logIn Response
import com.jobtracker.dto.LoginResponse;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtService = jwtService;
    }

    public UserResponse register(UserRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            // Without proper exception handling, this would throw a NullPointerException if the email is already registered.
            // throw new RuntimeException("Email already registered");

            // Proper Exception handling 
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        String hashedPassword =
                passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getName(),
                request.getEmail(),
                hashedPassword,
                request.getMobileNumber()
        );

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getMobileNumber()
        );
    }

    // LogIn Response 
    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        // new RuntimeException("Invalid email or password"));
                    new InvalidCredentialsException());

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            // throw new RuntimeException("Invalid email or password");
            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(token);
    }

    
}


// passwordEncoder.encode(request.getPassword());
//  turns something like:  mypassword123 -> into a BCrypt hash.

// We never store the actual password in MongoDB.

// Flow: Without JWT

// Request
//    ↓
// UserRequest
//    ↓
// AuthService
//    ↓
// password → BCrypt hash
//    ↓
// User
//    ↓
// MongoDB

// And notice that UserResponse doesn't contain the password.

// Flow: With JWT

// Register
//    ↓
// BCrypt password hash
//    ↓
// MongoDB

// Login
//    ↓
// Check email
//    ↓
// BCrypt password verification
//    ↓
// Generate JWT
//    ↓
// Return token






