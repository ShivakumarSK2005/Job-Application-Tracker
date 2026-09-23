package com.jobtracker.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "interviews")
public class Interview {

    @Id
    private String id;

    private String jobApplicationId;
    private LocalDate interviewDate;
    private String round;
    private String type;
    private String interviewer;
    private String result;

    public Interview() {
    }

    public Interview(
            String jobApplicationId,
            LocalDate interviewDate,
            String round,
            String type,
            String interviewer,
            String result) {

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

    public void setJobApplicationId(String jobApplicationId) {
        this.jobApplicationId = jobApplicationId;
    }

    public LocalDate getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(LocalDate interviewDate) {
        this.interviewDate = interviewDate;
    }

    public String getRound() {
        return round;
    }

    public void setRound(String round) {
        this.round = round;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getInterviewer() {
        return interviewer;
    }

    public void setInterviewer(String interviewer) {
        this.interviewer = interviewer;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }
}