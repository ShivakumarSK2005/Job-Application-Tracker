package com.jobtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class InterviewRequest {

    @NotNull(message = "Interview date is required")
    private LocalDate interviewDate;

    @NotBlank(message = "Round is required")
    private String round;

    @NotBlank(message = "Type is required")
    private String type;

    private String interviewer;

    private String result;

    private String notes;
    private String interviewTime;
    private String roundCategory;
    private String meetingLink;
    private java.util.List<String> reminders;

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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public java.util.List<String> getReminders() {
        return reminders;
    }

    public void setReminders(java.util.List<String> reminders) {
        this.reminders = reminders;
    }

    public String getInterviewTime() {
        return interviewTime;
    }

    public void setInterviewTime(String interviewTime) {
        this.interviewTime = interviewTime;
    }

    public String getRoundCategory() {
        return roundCategory;
    }

    public void setRoundCategory(String roundCategory) {
        this.roundCategory = roundCategory;
    }
}