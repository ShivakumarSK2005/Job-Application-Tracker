package com.jobtracker.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.HashMap;
//Handeling Valid ApplicationStatus Enum values
import org.springframework.http.converter.HttpMessageNotReadableException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle JobNotFoundException
    @ExceptionHandler(JobNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> handleJobNotFound(
            JobNotFoundException exception) {

        return Map.of(
                "message", exception.getMessage()
        );
    }

    // Handle validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationErrors(
            MethodArgumentNotValidException exception) {

        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return errors;
    }

    // Handeling Valid ApplicationStatus Enum values
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleInvalidRequest(
            HttpMessageNotReadableException exception) {

        return Map.of(
                "message", "Invalid request. Please check the values you provided."
        );
    }
    
        // Handle InterviewNotFoundException -> while deleting or updating an interview, if the interview with the given ID and job ID is not found, this exception will be thrown.
        @ExceptionHandler(InterviewNotFoundException.class)
        @ResponseStatus(HttpStatus.NOT_FOUND)
        public Map<String, String> handleInterviewNotFound(
                        InterviewNotFoundException exception) {

                return Map.of("message", exception.getMessage());
                }

        // Handle EmailAlreadyExistsException -> while registering a new user, if the email is already registered, this will be hadeled by handleEmailAlreadyExists.
        @ExceptionHandler(EmailAlreadyExistsException.class)
        @ResponseStatus(HttpStatus.CONFLICT)
        public Map<String, String> handleEmailAlreadyExists(
                EmailAlreadyExistsException exception) {

        return Map.of("message", exception.getMessage());
        }

        // Invalid Credentials Exception Handeling 
        @ExceptionHandler(InvalidCredentialsException.class)
        public ResponseEntity<Map<String, String>> handleInvalidCredentials(
                InvalidCredentialsException exception) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "message",
                        exception.getMessage()
                ));
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, String>>
        handleIllegalArgumentException(
                IllegalArgumentException exception) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "message",
                        exception.getMessage()
                ));
        }




}