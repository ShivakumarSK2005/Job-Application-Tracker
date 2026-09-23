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