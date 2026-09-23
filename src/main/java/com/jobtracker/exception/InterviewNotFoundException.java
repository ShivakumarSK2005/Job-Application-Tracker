package com.jobtracker.exception;

public class InterviewNotFoundException extends RuntimeException {

    public InterviewNotFoundException(String id) {
        super("Interview with id " + id + " not found");
    }
}