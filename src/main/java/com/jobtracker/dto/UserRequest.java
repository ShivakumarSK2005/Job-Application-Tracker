package com.jobtracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UserRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

// Why do we need this?
// We don't want the client directly sending a User entity.

// Instead:

// Client
//   ↓
// UserRequest DTO
//   ↓
// Service
//   ↓
// User entity
//   ↓
// MongoDB

// It also lets us validate:

// name     → required
// email    → required + valid email format
// password → required