package com.jobtracker.dto;

public class UserResponse {

    private String id;
    private String name;
    private String email;
    private String mobileNumber;

    public UserResponse(
            String id,
            String name,
            String email) {

        this.id = id;
        this.name = name;
        this.email = email;
    }

    public UserResponse(
            String id,
            String name,
            String email,
            String mobileNumber) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.mobileNumber = mobileNumber;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }
}



// Why separate UserResponse?

// Our entity contains:

// User
// ├── id
// ├── name
// ├── email
// └── password   ← sensitive

// But the API response should contain:

// UserResponse
// ├── id
// ├── name
// └── email