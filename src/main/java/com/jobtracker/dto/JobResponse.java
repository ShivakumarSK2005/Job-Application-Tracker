package com.jobtracker.dto;

import com.jobtracker.model.ApplicationStatus;
import java.time.LocalDate;

public class JobResponse {

    private String id;
    private String company;
    private String role;
    private String location;
    private ApplicationStatus status;
    private LocalDate appliedDate;
    private String userId;
    private String oaEventDate;
    private String oaPlatform;
    private String oaNotes;
    private java.util.List<String> oaReminders;
    private String interviewNotes;

    public JobResponse() {
    }

    public JobResponse(String id, String company, String role, String userId,
                       String location, ApplicationStatus status, LocalDate appliedDate) {
        this.id = id;
        this.company = company;
        this.role = role;
        this.location = location;
        this.status = status;
        this.appliedDate = appliedDate;
        this.userId = userId;
    }

    public JobResponse(String id, String company, String role, String userId,
                       String location, ApplicationStatus status, LocalDate appliedDate,
                       String oaEventDate, String oaPlatform, String oaNotes, java.util.List<String> oaReminders) {
        this(id, company, role, userId, location, status, appliedDate, oaEventDate, oaPlatform, oaNotes, oaReminders, null);
    }

    public JobResponse(String id, String company, String role, String userId,
                       String location, ApplicationStatus status, LocalDate appliedDate,
                       String oaEventDate, String oaPlatform, String oaNotes, java.util.List<String> oaReminders,
                       String interviewNotes) {
        this.id = id;
        this.company = company;
        this.role = role;
        this.location = location;
        this.status = status;
        this.appliedDate = appliedDate;
        this.userId = userId;
        this.oaEventDate = oaEventDate;
        this.oaPlatform = oaPlatform;
        this.oaNotes = oaNotes;
        this.oaReminders = oaReminders;
        this.interviewNotes = interviewNotes;
    }

    public String getId() {
        return id;
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

    public LocalDate getAppliedDate(){
        return appliedDate;
    }

    public String getUserId() {
        return userId;
    }

    public String getOaEventDate() {
        return oaEventDate;
    }

    public String getOaPlatform() {
        return oaPlatform;
    }

    public String getOaNotes() {
        return oaNotes;
    }

    public java.util.List<String> getOaReminders() {
        return oaReminders;
    }

    public String getInterviewNotes() {
        return interviewNotes;
    }
}

// Why do we need another DTO?

// Think of the two DTOs as having different directions:

//              CLIENT
//                ↕
//        ┌───────┴───────┐
//        ↓               ↑
//  JobRequest       JobResponse
//        ↓               ↑
//        └── Controller ─┘
//                ↓
//         JobApplication

// JobRequest → what the client is allowed to send

// JobResponse → what the server chooses to return

//
// For example, later JobApplication might contain internal fields:

// private String internalNotes;
// private String userId;
// private String resumePath;

// You might not want all of those sent to the client.

// That's why DTOs provide a boundary between your API and your internal model.

// Pagination
// Pageable = pagination instructions supplied by the request (and defaults/configuration if omitted).
// And Page<T> = the actual result + pagination information.

// Pageable = what page/data size I want
// Page<T> = the page of data I actually got back.

// Pageable contains both pagination and sorting information.
// So sorting happens before pagination.

// "A page containing JobApplication objects."
// It contains more than just the jobs. It also has pagination information such as:

// Page<JobApplication>
// ├── Job applications
// ├── Current page
// ├── Page size
// ├── Total elements
// ├── Total pages
// └── etc.
