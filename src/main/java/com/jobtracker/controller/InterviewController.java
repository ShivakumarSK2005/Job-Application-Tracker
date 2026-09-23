package com.jobtracker.controller;

import com.jobtracker.dto.InterviewRequest;
import com.jobtracker.model.Interview;
import com.jobtracker.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
// DTO for interview response
import com.jobtracker.dto.InterviewResponse;

import java.util.List;

@RestController
@RequestMapping("/api/jobs/{jobId}/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    // public Interview createInterview(
    public InterviewResponse createInterview(
            @PathVariable String jobId,
            @Valid @RequestBody InterviewRequest request) {

        return interviewService.createInterview(jobId, request);
    }

    @GetMapping
    // public List<Interview> getInterviews(
    public List<InterviewResponse> getInterviews(
            @PathVariable String jobId) {

        return interviewService.getInterviewsByJobId(jobId);
    }

    // Update Interview
    @PutMapping("/{interviewId}")
    public InterviewResponse updateInterview(
            @PathVariable String jobId,
            @PathVariable String interviewId,
            @Valid @RequestBody InterviewRequest request) {

        return interviewService.updateInterview(
                jobId,
                interviewId,
                request
        );
    }

    // Delete Interview
    @DeleteMapping("/{interviewId}")
    public String deleteInterview(
            @PathVariable String jobId,
            @PathVariable String interviewId) {

        interviewService.deleteInterview(jobId, interviewId);

        return "Interview deleted successfully";
    }
}

// Our new endpoints
// Create an interview
// POST /api/jobs/{jobId}/interviews

// Example:

// POST /api/jobs/6aad80410a891a17b58166b9/interviews

// Body:

// {
//   "interviewDate": "2026-09-25",
//   "round": "Technical",
//   "type": "Online",
//   "interviewer": "John",
//   "result": "PENDING"
// }
// Get interviews for a job
// GET /api/jobs/6aad80410a891a17b58166b9/interviews

// This should return all interviews belonging to that job.

// Notice the URL structure
// /api/jobs/{jobId}/interviews

// This communicates the relationship directly:

// Job
//  └── Interviews
//       ├── Interview 1
//       ├── Interview 2
//       └── Interview 3


// Flow with InterviewResponse:
// But your architecture becomes cleaner:

// Request DTO
//      ↓
// Controller
//      ↓
// Service
//      ↓
// Entity
//      ↓
// MongoDB
//      ↓
// Entity
//      ↓
// Response DTO
//      ↓
// Controller
//      ↓
// Client