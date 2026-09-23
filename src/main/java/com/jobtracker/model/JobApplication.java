package com.jobtracker.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "job_applications")
public class JobApplication {

    @Id
    private String id;

    @NotBlank(message = "Company is required")
    private String company;

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Location is required")
    private String location;

    // @NotBlank is for String-like values, while @NotNull is appropriate for an enum.

    @NotNull(message = "Status is required")
    private ApplicationStatus status;

    @NotNull(message = "Application date is required")
    private LocalDate appliedDate;

    private String userId;

    private String oaEventDate;
    private String oaPlatform;
    private String oaNotes;
    private java.util.List<String> oaReminders;

    public JobApplication() {
    }

    public JobApplication(String id, String company, String role,
                          String location, ApplicationStatus status, LocalDate appliedDate) {
        this.id = id;
        this.company = company;
        this.role = role;
        this.location = location;
        this.status = status;
        this.appliedDate = appliedDate;
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

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setId(String id) {
        this.id = id;
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