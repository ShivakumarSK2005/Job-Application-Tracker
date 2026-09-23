package com.jobtracker.service;

import com.jobtracker.dto.InterviewRequest;
import com.jobtracker.dto.InterviewResponse;
import com.jobtracker.exception.InterviewNotFoundException;
import com.jobtracker.exception.JobNotFoundException;
import com.jobtracker.model.Interview;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.User;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobRepository;
import com.jobtracker.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterviewServiceTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private InterviewService interviewService;

    private User user;
    private JobApplication job;
    private InterviewRequest request;

    @BeforeEach
    void setUp() {

        user = mock(User.class);

        when(user.getId()).thenReturn("user123");

        job = mock(JobApplication.class);

        request = new InterviewRequest();

        request.setInterviewDate(LocalDate.now());
        request.setRound("Technical");
        request.setType("Online");
        request.setInterviewer("John");
        request.setResult(null);
    }

    // ---------------------------------------------------------
    // Helper
    // ---------------------------------------------------------

    private void mockCurrentUser() {

        when(securityContext.getAuthentication())
                .thenReturn(authentication);

        when(authentication.getName())
                .thenReturn("test@gmail.com");

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        SecurityContextHolder.setContext(securityContext);
    }


    // =========================================================
    // CREATE
    // =========================================================

    @Test
    void createInterview_shouldCreateInterviewSuccessfully() {

        mockCurrentUser();

        when(jobRepository.findByIdAndUserId(
                "job123",
                "user123"
        )).thenReturn(Optional.of(job));

        Interview interview = mock(Interview.class);

        when(interview.getId())
                .thenReturn("interview123");

        when(interview.getJobApplicationId())
                .thenReturn("job123");

        when(interview.getInterviewDate())
                .thenReturn(LocalDate.now());

        when(interview.getRound())
                .thenReturn("Technical");

        when(interview.getType())
                .thenReturn("Online");

        when(interview.getInterviewer())
                .thenReturn("John");

        when(interview.getResult())
                .thenReturn(null);

        when(interviewRepository.save(any(Interview.class)))
                .thenReturn(interview);

        InterviewResponse result =
                interviewService.createInterview(
                        "job123",
                        request
                );

        assertNotNull(result);

        assertEquals(
                "interview123",
                result.getId()
        );

        assertEquals(
                "job123",
                result.getJobApplicationId()
        );

        assertEquals(
                LocalDate.now(),
                result.getInterviewDate()
        );

        assertEquals(
                "Technical",
                result.getRound()
        );

        assertEquals(
                "Online",
                result.getType()
        );

        assertEquals(
                "John",
                result.getInterviewer()
        );

        verify(jobRepository)
                .findByIdAndUserId(
                        "job123",
                        "user123"
                );

        verify(interviewRepository)
                .save(any(Interview.class));
    }


    @Test
    void createInterview_shouldRejectAnotherUsersJob() {

        mockCurrentUser();

        when(jobRepository.findByIdAndUserId(
                "job123",
                "user123"
        )).thenReturn(Optional.empty());

        assertThrows(
                JobNotFoundException.class,
                () -> interviewService.createInterview(
                        "job123",
                        request
                )
        );

        verify(interviewRepository, never())
                .save(any(Interview.class));
    }


    // =========================================================
    // READ
    // =========================================================

    @Test
    void getInterviewsByJobId_shouldReturnInterviewsSuccessfully() {

        mockCurrentUser();

        when(jobRepository.findByIdAndUserId(
                "job123",
                "user123"
        )).thenReturn(Optional.of(job));

        Interview interview = mock(Interview.class);

        when(interview.getId())
                .thenReturn("interview123");

        when(interview.getJobApplicationId())
                .thenReturn("job123");

        when(interview.getInterviewDate())
                .thenReturn(LocalDate.now());

        when(interview.getRound())
                .thenReturn("Technical");

        when(interview.getType())
                .thenReturn("Online");

        when(interview.getInterviewer())
                .thenReturn("John");

        when(interview.getResult())
                .thenReturn(null);

        when(interviewRepository.findByJobApplicationId(
                "job123"
        )).thenReturn(List.of(interview));

        List<InterviewResponse> result =
                interviewService.getInterviewsByJobId(
                        "job123"
                );

        assertNotNull(result);

        assertEquals(
                1,
                result.size()
        );

        assertEquals(
                "interview123",
                result.get(0).getId()
        );

        assertEquals(
                "job123",
                result.get(0).getJobApplicationId()
        );

        assertEquals(
                "Technical",
                result.get(0).getRound()
        );

        verify(interviewRepository)
                .findByJobApplicationId("job123");
    }


    @Test
    void getInterviewsByJobId_shouldRejectAnotherUsersJob() {

        mockCurrentUser();

        when(jobRepository.findByIdAndUserId(
                "job123",
                "user123"
        )).thenReturn(Optional.empty());

        assertThrows(
                JobNotFoundException.class,
                () -> interviewService.getInterviewsByJobId(
                        "job123"
                )
        );

        verify(interviewRepository, never())
                .findByJobApplicationId(anyString());
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @Test
    void updateInterview_shouldUpdateSuccessfully() {

        mockCurrentUser();

        when(jobRepository.findByIdAndUserId(
                "job123",
                "user123"
        )).thenReturn(Optional.of(job));

        Interview interview = mock(Interview.class);

        when(interview.getId())
                .thenReturn("interview123");

        when(interview.getJobApplicationId())
                .thenReturn("job123");

        when(interview.getInterviewDate())
                .thenReturn(LocalDate.now());

        when(interview.getRound())
                .thenReturn("Technical");

        when(interview.getType())
                .thenReturn("Online");

        when(interview.getInterviewer())
                .thenReturn("John");

        when(interview.getResult())
                .thenReturn(null);

        when(interviewRepository.findByIdAndJobApplicationId(
                "interview123",
                "job123"
        )).thenReturn(Optional.of(interview));

        when(interviewRepository.save(any(Interview.class)))
                .thenReturn(interview);

        InterviewRequest updateRequest =
                new InterviewRequest();

        updateRequest.setInterviewDate(
                LocalDate.now().plusDays(2)
        );

        updateRequest.setRound("HR");

        updateRequest.setType("Offline");

        updateRequest.setInterviewer("David");

        updateRequest.setResult("Passed");

        InterviewResponse result =
                interviewService.updateInterview(
                        "job123",
                        "interview123",
                        updateRequest
                );

        assertNotNull(result);

        assertEquals(
                "interview123",
                result.getId()
        );

        verify(interviewRepository)
                .findByIdAndJobApplicationId(
                        "interview123",
                        "job123"
                );

        verify(interviewRepository)
                .save(interview);

        verify(interview)
                .setInterviewDate(
                        updateRequest.getInterviewDate()
                );

        verify(interview)
                .setRound(
                        updateRequest.getRound()
                );

        verify(interview)
                .setType(
                        updateRequest.getType()
                );

        verify(interview)
                .setInterviewer(
                        updateRequest.getInterviewer()
                );

        verify(interview)
                .setResult(
                        updateRequest.getResult()
                );
    }


    @Test
    void updateInterview_shouldRejectAnotherUsersJob() {

        mockCurrentUser();

        when(jobRepository.findByIdAndUserId(
                "job123",
                "user123"
        )).thenReturn(Optional.empty());

        assertThrows(
                JobNotFoundException.class,
                () -> interviewService.updateInterview(
                        "job123",
                        "interview123",
                        request
                )
        );

        verify(interviewRepository, never())
                .findByIdAndJobApplicationId(
                        anyString(),
                        anyString()
                );

        verify(interviewRepository, never())
                .save(any(Interview.class));
    }


    @Test
    void updateInterview_shouldThrowExceptionWhenInterviewDoesNotExist() {

        mockCurrentUser();

        when(jobRepository.findByIdAndUserId(
                "job123",
                "user123"
        )).thenReturn(Optional.of(job));

        when(interviewRepository.findByIdAndJobApplicationId(
                "interview123",
                "job123"
        )).thenReturn(Optional.empty());

        assertThrows(
                InterviewNotFoundException.class,
                () -> interviewService.updateInterview(
                        "job123",
                        "interview123",
                        request
                )
        );

        verify(interviewRepository, never())
                .save(any(Interview.class));
    }


    // =========================================================
    // DELETE
    // =========================================================

    @Test
    void deleteInterview_shouldDeleteSuccessfully() {

        mockCurrentUser();

        when(jobRepository.findByIdAndUserId(
                "job123",
                "user123"
        )).thenReturn(Optional.of(job));

        Interview interview = mock(Interview.class);

        when(interviewRepository.findByIdAndJobApplicationId(
                "interview123",
                "job123"
        )).thenReturn(Optional.of(interview));

        interviewService.deleteInterview(
                "job123",
                "interview123"
        );

        verify(interviewRepository)
                .delete(interview);
    }


    @Test
    void deleteInterview_shouldRejectAnotherUsersJob() {

        mockCurrentUser();

        when(jobRepository.findByIdAndUserId(
                "job123",
                "user123"
        )).thenReturn(Optional.empty());

        assertThrows(
                JobNotFoundException.class,
                () -> interviewService.deleteInterview(
                        "job123",
                        "interview123"
                )
        );

        verify(interviewRepository, never())
                .findByIdAndJobApplicationId(
                        anyString(),
                        anyString()
                );

        verify(interviewRepository, never())
                .delete(any(Interview.class));
    }


    @Test
    void deleteInterview_shouldThrowExceptionWhenInterviewDoesNotExist() {

        mockCurrentUser();

        when(jobRepository.findByIdAndUserId(
                "job123",
                "user123"
        )).thenReturn(Optional.of(job));

        when(interviewRepository.findByIdAndJobApplicationId(
                "interview123",
                "job123"
        )).thenReturn(Optional.empty());

        assertThrows(
                InterviewNotFoundException.class,
                () -> interviewService.deleteInterview(
                        "job123",
                        "interview123"
                )
        );

        verify(interviewRepository, never())
                .delete(any(Interview.class));
    }
}