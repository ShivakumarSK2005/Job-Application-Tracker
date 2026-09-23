package com.jobtracker.service;

import com.jobtracker.dto.InterviewRequest;
import com.jobtracker.exception.JobNotFoundException;
import com.jobtracker.model.Interview;
import com.jobtracker.model.JobApplication;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.stereotype.Service;
//interviewResponse DTO
import com.jobtracker.dto.InterviewResponse;
// delete InterviewNotFoundException import
import com.jobtracker.exception.InterviewNotFoundException;
//User Authentication
import com.jobtracker.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public InterviewService(
            InterviewRepository interviewRepository,
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.interviewRepository = interviewRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    // Get Current User From The Auth (JWT)
    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        }

    // public Interview createInterview(
    public InterviewResponse createInterview(
            String jobId,
            InterviewRequest request) {

        // if (!jobRepository.existsById(jobId)) {
        //     throw new JobNotFoundException(jobId);
        // }

        User user = getCurrentUser();
        JobApplication job = jobRepository
                .findByIdAndUserId(jobId, user.getId())
                .orElseThrow(() ->
                        new JobNotFoundException(jobId));

        Interview interview = new Interview();

        interview.setJobApplicationId(jobId);
        interview.setInterviewDate(request.getInterviewDate());
        interview.setRound(request.getRound());
        interview.setType(request.getType());
        interview.setInterviewer(request.getInterviewer());
        interview.setResult(request.getResult());
        interview.setNotes(request.getNotes());
        interview.setInterviewTime(request.getInterviewTime());
        interview.setRoundCategory(request.getRoundCategory());
        interview.setMeetingLink(request.getMeetingLink());
        interview.setReminders(request.getReminders());

        Interview savedInterview = interviewRepository.save(interview);

        return toInterviewResponse(savedInterview);
    }

    // Update Interview
    public InterviewResponse updateInterview(
            String jobId,
            String interviewId,
            InterviewRequest request) {

        User user = getCurrentUser();
        jobRepository.findByIdAndUserId(
                jobId,
                user.getId()
        ).orElseThrow(() ->
                new JobNotFoundException(jobId));

        Interview interview = interviewRepository
                .findByIdAndJobApplicationId(interviewId, jobId)
                .orElseThrow(() -> 
                        new InterviewNotFoundException(interviewId)); 

        interview.setInterviewDate(request.getInterviewDate());
        interview.setRound(request.getRound());
        interview.setType(request.getType());
        interview.setInterviewer(request.getInterviewer());
        interview.setResult(request.getResult());
        interview.setNotes(request.getNotes());
        interview.setInterviewTime(request.getInterviewTime());
        interview.setRoundCategory(request.getRoundCategory());
        interview.setMeetingLink(request.getMeetingLink());
        interview.setReminders(request.getReminders());

        Interview savedInterview = interviewRepository.save(interview);

        return toInterviewResponse(savedInterview);
    }

    // Delete Interview
    public void deleteInterview(String jobId, String interviewId) {

        // if (!jobRepository.existsById(jobId)) {
        //     throw new JobNotFoundException(jobId);
        // }
        User user = getCurrentUser();
        jobRepository.findByIdAndUserId(
                jobId,
                user.getId()
        ).orElseThrow(() ->
                new JobNotFoundException(jobId));

        Interview interview = interviewRepository
                .findByIdAndJobApplicationId(interviewId, jobId)
                .orElseThrow(() -> // Proper Exception handling 
                        new InterviewNotFoundException(interviewId));
                // not handeling exception will throw a NullPointerException if the interview is not found.(below line)
                // .orElseThrow(() ->
                //         new RuntimeException("Interview not found"));

        interviewRepository.delete(interview);
    }

    // public List<Interview> getInterviewsByJobId(String jobId) {
    public List<InterviewResponse> getInterviewsByJobId(String jobId) {

        // if (!jobRepository.existsById(jobId)) {
        //     throw new JobNotFoundException(jobId);
        // }
        User user = getCurrentUser();
        jobRepository.findByIdAndUserId(
                jobId,
                user.getId()
        ).orElseThrow(() ->
                new JobNotFoundException(jobId));

        // return interviewRepository.findByJobApplicationId(jobId);
        List<Interview> interviews =
                interviewRepository.findByJobApplicationId(jobId);

        return interviews.stream()
                .map(this::toInterviewResponse)
                .toList();
    }

    private InterviewResponse toInterviewResponse(Interview interview) {
        return new InterviewResponse(
                interview.getId(),
                interview.getJobApplicationId(),
                interview.getInterviewDate(),
                interview.getRound(),
                interview.getType(),
                interview.getInterviewer(),
                interview.getResult(),
                interview.getNotes(),
                interview.getInterviewTime(),
                interview.getRoundCategory(),
                interview.getMeetingLink(),
                interview.getReminders()
        );
    }
}

// The important part

// Notice this:

// if (!jobRepository.existsById(jobId)) {
//     throw new JobNotFoundException(jobId);
// }

// We're checking:

// Does this JobApplication actually exist?
//         ↓
//        YES → create/find interviews
//         ↓
//        NO → 404 Job Not Found

// This prevents an interview from being created for a job that doesn't exist.

// Our flow is becoming:
// POST /api/jobs/{jobId}/interviews
//              ↓
//      InterviewController
//              ↓
//       InterviewService
//         ↙           ↘
// JobRepository    InterviewRepository
//      ↓                  ↓
// Check job          Save interview
// exists








// InterviewResponse DTO Flow 

// MongoDB
//    ↓
// List<Interview>
//    ↓
// stream().map()
//    ↓
// List<InterviewResponse>