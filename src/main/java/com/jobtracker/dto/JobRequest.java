package com.jobtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.jobtracker.model.ApplicationStatus;
import java.time.LocalDate;
// Size Validations 
import jakarta.validation.constraints.Size;

// DTOs (Data Transfer Objects).
// A DTO is a Java class used to carry data from one part of your application to another, especially between your backend and frontend.
// So the DTO acts like a controlled package of data that you transfer.
// You don't want user to give his own id for application, you want it to handle it by sevrver so, the DTO is used to control what data is sent from the client to the server. It can also be used to validate the data before it reaches your backend logic.
// and some times you dont want all the data present in your entity to be sent to the client, so you can use DTO to control what data is sent from the server to the client.


// So your understanding can be summarized as:

// DTOs define the shape of data that crosses a boundary.

// They can be used to:

// ✅ Control client → server data
// ✅ Control server → client data
// ✅ Validate incoming data
// ✅ Prevent exposing unnecessary/sensitive entity fields
// ✅ Keep your API contract separate from your database/entity structure

// One important correction to your wording: a DTO itself doesn't automatically validate data. You typically put validation annotations such as @NotBlank, @Email, @Size, etc. on the DTO and have Spring perform the validation.

// @NotBlank is for String-like values, while @NotNull is appropriate for an enum.

public class JobRequest {

    @NotBlank(message = "Company is required")
    @Size(max = 100, message = "Company name cannot exceed 100 characters")
    private String company;

    @NotBlank(message = "Role is required")
    @Size(max = 100, message = "Role cannot exceed 100 characters")
    private String role;

    @NotBlank(message = "Location is required")
    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String location;

    @NotNull(message = "Status is required")
    private ApplicationStatus status;

    @NotNull(message="Applied date is required")
    private LocalDate appliedDate;

    private String oaEventDate;
    private String oaPlatform;
    private String oaNotes;
    private java.util.List<String> oaReminders;

    public JobRequest() {
    }

    public String getCompany() {
        return company;
    }

    public String getRole() {
        return role;
    }

    public String getLocation() {
        return location;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public void setAppliedDate(LocalDate appliedDate) {
        this.appliedDate = appliedDate;
    }

    public String getOaEventDate() {
        return oaEventDate;
    }

    public void setOaEventDate(String oaEventDate) {
        this.oaEventDate = oaEventDate;
    }

    public String getOaPlatform() {
        return oaPlatform;
    }

    public void setOaPlatform(String oaPlatform) {
        this.oaPlatform = oaPlatform;
    }

    public String getOaNotes() {
        return oaNotes;
    }

    public void setOaNotes(String oaNotes) {
        this.oaNotes = oaNotes;
    }

    public java.util.List<String> getOaReminders() {
        return oaReminders;
    }

    public void setOaReminders(java.util.List<String> oaReminders) {
        this.oaReminders = oaReminders;
    }
}


// Complete DTO Both Request and Response

// What happens now?
// MongoDB later
//      ↓
// JobApplication
//      ↓
//    Service
//      ↓
// JobResponse
//      ↓
//  Controller
//      ↓
//    Client

// So the JobApplication model is not directly exposed through your API.

// For example, internally you could have:

// JobApplication : id, company, role, location, status, internalNotes, resumePath

// But JobResponse could expose only:

// JobResponse : id, company, role, location, status

// That's the main benefit of response DTOs.

// One more change

// Since we're now returning JobResponse, your POST currently returns JobApplication directly.

// We'll eventually change POST and PUT to return JobResponse too, giving us a clean boundary:

// Request DTO  →  Controller  →  Service  →  Model
//                                                ↓
// Response DTO ←  Controller  ←  Service  ←────┘

// For now, change GET and test it. Your JSON output should look exactly the same — the difference is what's happening internally.