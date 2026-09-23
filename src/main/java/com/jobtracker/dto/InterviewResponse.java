package com.jobtracker.dto;

import java.time.LocalDate;

public class InterviewResponse {

    private String id;
    private String jobApplicationId;
    private LocalDate interviewDate;
    private String round;
    private String type;
    private String interviewer;
    private String result;
    private String notes;
    private String interviewTime;
    private String roundCategory;
    private String meetingLink;
    private java.util.List<String> reminders;

    public InterviewResponse(
            String id,
            String jobApplicationId,
            LocalDate interviewDate,
            String round,
            String type,
            String interviewer,
            String result) {

        this.id = id;
        this.jobApplicationId = jobApplicationId;
        this.interviewDate = interviewDate;
        this.round = round;
        this.type = type;
        this.interviewer = interviewer;
        this.result = result;
    }

    public InterviewResponse(
            String id,
            String jobApplicationId,
            LocalDate interviewDate,
            String round,
            String type,
            String interviewer,
            String result,
            String notes) {

        this.id = id;
        this.jobApplicationId = jobApplicationId;
        this.interviewDate = interviewDate;
        this.round = round;
        this.type = type;
        this.interviewer = interviewer;
        this.result = result;
        this.notes = notes;
    }

    public InterviewResponse(
            String id,
            String jobApplicationId,
            LocalDate interviewDate,
            String round,
            String type,
            String interviewer,
            String result,
            String notes,
            String interviewTime,
            String roundCategory,
            String meetingLink,
            java.util.List<String> reminders) {

        this.id = id;
        this.jobApplicationId = jobApplicationId;
        this.interviewDate = interviewDate;
        this.round = round;
        this.type = type;
        this.interviewer = interviewer;
        this.result = result;
        this.notes = notes;
        this.interviewTime = interviewTime;
        this.roundCategory = roundCategory;
        this.meetingLink = meetingLink;
        this.reminders = reminders;
    }

    public String getId() {
        return id;
    }

    public String getJobApplicationId() {
        return jobApplicationId;
    }

    public LocalDate getInterviewDate() {
        return interviewDate;
    }

    public String getRound() {
        return round;
    }

    public String getType() {
        return type;
    }

    public String getInterviewer() {
        return interviewer;
    }

    public String getResult() {
        return result;
    }

    public String getNotes() {
        return notes;
    }

    public String getInterviewTime() {
        return interviewTime;
    }

    public String getRoundCategory() {
        return roundCategory;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public java.util.List<String> getReminders() {
        return reminders;
    }
}

// Before : without InterviewResponse, the flow was:

// Interview entity
//         ↓
// Controller
//         ↓
//      Client

// We're changing it to: With InterviewResponse, the flow is now:

// Interview entity
//         ↓
// InterviewResponse
//         ↓
//      Client