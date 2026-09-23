package com.jobtracker.service;

import com.jobtracker.dto.JobResponse;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.User;
import com.jobtracker.repository.JobRepository;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.exception.JobNotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private JobService jobService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createJob_shouldCreateJobSuccessfully() {

        // Arrange
        User user = Mockito.mock(User.class);

        when(user.getId())
                .thenReturn("user123");

        JobApplication job = new JobApplication(
                null,
                "Google",
                "Software Engineer",
                "Bangalore",
                ApplicationStatus.APPLIED,
                LocalDate.of(2026, 9, 20)
        );

        // Mock authenticated user
        Authentication authentication =
                Mockito.mock(Authentication.class);

        when(authentication.getName())
                .thenReturn("john@gmail.com");

        SecurityContext securityContext =
                Mockito.mock(SecurityContext.class);

        when(securityContext.getAuthentication())
                .thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);

        // Mock user lookup
        when(userRepository.findByEmail("john@gmail.com"))
                .thenReturn(Optional.of(user));

        // Mock saving job
        when(jobRepository.save(any(JobApplication.class)))
                .thenAnswer(invocation -> {

                    JobApplication savedJob =
                            invocation.getArgument(0);

                    savedJob.setId("job123");

                    return savedJob;
                });

        // Act
        JobResponse response =
                jobService.createJob(job);

        // Assert
        assertEquals("job123", response.getId());
        assertEquals("user123", response.getUserId());
        assertEquals("Google", response.getCompany());
        assertEquals(
                "Software Engineer",
                response.getRole()
        );

        verify(jobRepository).save(job);
    }

    //
    @Test
    void getJobById_shouldReturnJobForCurrentUser() {

        // Arrange
        User user = Mockito.mock(User.class);

        when(user.getId())
                .thenReturn("user123");

        Authentication authentication =
                Mockito.mock(Authentication.class);

        when(authentication.getName())
                .thenReturn("john@gmail.com");

        SecurityContext securityContext =
                Mockito.mock(SecurityContext.class);

        when(securityContext.getAuthentication())
                .thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail("john@gmail.com"))
                .thenReturn(Optional.of(user));

        JobApplication job = new JobApplication(
                "job123",
                "Google",
                "Software Engineer",
                "Bangalore",
                ApplicationStatus.APPLIED,
                LocalDate.of(2026, 9, 20)
        );

        job.setUserId("user123");

        when(jobRepository.findByIdAndUserId(
                "job123",
                "user123"
        )).thenReturn(Optional.of(job));

        // Act
        JobResponse response =
                jobService.getJobById("job123");

        // Assert
        assertEquals("job123", response.getId());
        assertEquals("Google", response.getCompany());
        assertEquals("Software Engineer", response.getRole());
        assertEquals("user123", response.getUserId());
    }

    //
    @Test
    void getJobById_shouldThrowExceptionWhenJobDoesNotBelongToUser() {

        // Arrange
        User user = Mockito.mock(User.class);

        when(user.getId())
                .thenReturn("user123");

        Authentication authentication =
                Mockito.mock(Authentication.class);

        when(authentication.getName())
                .thenReturn("john@gmail.com");

        SecurityContext securityContext =
                Mockito.mock(SecurityContext.class);

        when(securityContext.getAuthentication())
                .thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail("john@gmail.com"))
                .thenReturn(Optional.of(user));

        when(jobRepository.findByIdAndUserId(
                "job999",
                "user123"
        )).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(
                JobNotFoundException.class,
                () -> jobService.getJobById("job999")
        );
    }

    //
    @Test
    void updateJob_shouldUpdateJobForCurrentUser() {

        // Arrange
        User user = Mockito.mock(User.class);

        when(user.getId())
                .thenReturn("user123");

        Authentication authentication =
                Mockito.mock(Authentication.class);

        when(authentication.getName())
                .thenReturn("john@gmail.com");

        SecurityContext securityContext =
                Mockito.mock(SecurityContext.class);

        when(securityContext.getAuthentication())
                .thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail("john@gmail.com"))
                .thenReturn(Optional.of(user));

        JobApplication existingJob = new JobApplication(
                "job123",
                "Google",
                "Software Engineer",
                "Bangalore",
                ApplicationStatus.APPLIED,
                LocalDate.of(2026, 9, 20)
        );

        existingJob.setUserId("user123");

        when(jobRepository.findByIdAndUserId(
                "job123",
                "user123"
        )).thenReturn(Optional.of(existingJob));

        when(jobRepository.save(any(JobApplication.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        JobApplication updatedJob = new JobApplication(
                "job123",
                "Microsoft",
                "Software Engineer",
                "Hyderabad",
                ApplicationStatus.INTERVIEW,
                LocalDate.of(2026, 9, 21)
        );

        // Act
        JobResponse response =
                jobService.updateJob("job123", updatedJob);

        // Assert
        assertEquals("job123", response.getId());
        assertEquals("Microsoft", response.getCompany());
        assertEquals("Software Engineer", response.getRole());
        assertEquals("Hyderabad", response.getLocation());
        assertEquals(
                ApplicationStatus.INTERVIEW,
                response.getStatus()
        );
        assertEquals("user123", response.getUserId());

        verify(jobRepository).save(existingJob);
    }

    //
    @Test
    void updateJob_shouldThrowExceptionWhenJobDoesNotBelongToUser() {

        mockCurrentUser();

        String jobId = "job123";

        JobApplication updatedJob = new JobApplication(
                null,
                "Google",
                "Software Engineer",
                "Bangalore",
                ApplicationStatus.INTERVIEW,
                LocalDate.now()
        );

        when(jobRepository.findByIdAndUserId(jobId, "user123"))
                .thenReturn(Optional.empty());

        assertThrows(
                JobNotFoundException.class,
                () -> jobService.updateJob(jobId, updatedJob)
        );

        verify(jobRepository, never()).save(any());
    }

    @Test
    void deleteJob_shouldDeleteJobSuccessfully() {

        mockCurrentUser();

        JobApplication job = new JobApplication(
                "job123",
                "Google",
                "Software Engineer",
                "Bangalore",
                ApplicationStatus.INTERVIEW,
                LocalDate.now()
        );

        job.setUserId("user123");

        when(jobRepository.findByIdAndUserId("job123", "user123"))
                .thenReturn(Optional.of(job));

        jobService.deleteJob("job123");

        verify(jobRepository).delete(job);
    }

    @Test
    void deleteJob_shouldThrowExceptionWhenJobDoesNotBelongToUser() {

        mockCurrentUser();

        when(jobRepository.findByIdAndUserId("job123", "user123"))
                .thenReturn(Optional.empty());

        assertThrows(
                JobNotFoundException.class,
                () -> jobService.deleteJob("job123")
        );

        verify(jobRepository, never()).delete(any());
    }

    @Test
    void updateStatus_shouldUpdateStatusSuccessfully() {

        mockCurrentUser();

        JobApplication job = new JobApplication(
                "job123",
                "Google",
                "Software Engineer",
                "Bangalore",
                ApplicationStatus.APPLIED,
                LocalDate.now()
        );

        job.setUserId("user123");

        when(jobRepository.findByIdAndUserId("job123", "user123"))
                .thenReturn(Optional.of(job));

        when(jobRepository.save(any(JobApplication.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        JobResponse response =
                jobService.updateStatus(
                        "job123",
                        ApplicationStatus.INTERVIEW
                );

        assertEquals(ApplicationStatus.INTERVIEW, response.getStatus());

        verify(jobRepository).save(job);
    }

    @Test
    void updateStatus_shouldThrowExceptionWhenJobDoesNotBelongToUser() {

        mockCurrentUser();

        when(jobRepository.findByIdAndUserId("job123", "user123"))
                .thenReturn(Optional.empty());

        assertThrows(
                JobNotFoundException.class,
                () -> jobService.updateStatus(
                        "job123",
                        ApplicationStatus.INTERVIEW
                )
        );

        verify(jobRepository, never()).save(any());
    }

    private void mockCurrentUser() {

        User user = mock(User.class);

        when(user.getId()).thenReturn("user123");

        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);

        when(authentication.getName())
                .thenReturn("test@gmail.com");

        when(securityContext.getAuthentication())
                .thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));
    }

    // createJob_shouldRejectFutureAppliedDate
    // → Should reject creating a job when the applied date is in the future.

    @Test
    void createJob_shouldRejectFutureAppliedDate() {

        mockCurrentUser();

        JobApplication job = new JobApplication(
                null,
                "Google",
                "Software Engineer",
                "Bangalore",
                ApplicationStatus.APPLIED,
                LocalDate.now().plusDays(1)
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> jobService.createJob(job)
        );

        verify(jobRepository, never()).save(any());
    }


    // updateJob_shouldRejectFutureAppliedDate
    // → Should reject updating a job when the new applied date is in the future.

    @Test
    void updateJob_shouldRejectFutureAppliedDate() {

        mockCurrentUser();

        JobApplication updatedJob = new JobApplication(
                null,
                "Google",
                "Software Engineer",
                "Bangalore",
                ApplicationStatus.INTERVIEW,
                LocalDate.now().plusDays(1)
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> jobService.updateJob("job123", updatedJob)
        );

        verify(jobRepository, never()).save(any());
    }


}

// Explaination 
// What these annotations mean -> @Mock -> creates a fake dependency.

// For example:
// JobService
//    ↓
// fake JobRepository

// So we don't actually access MongoDB.

// @InjectMocks
// private JobService jobService;

// Mockito creates the real JobService and puts the mocked dependencies inside it:

// JobService
//  ├── fake JobRepository
//  ├── fake UserRepository
//  └── fake MongoTemplate
// @BeforeEach

// runs before every test.

// MockitoAnnotations.openMocks(this);

// initializes the mocks.

// And:

// @Test
// void createJob_shouldCreateJobSuccessfully()

// is our first test.

// For now, don't put anything inside the test method.

// Run:

// .\mvnw.cmd test

// If it passes, we'll write the actual createJob() test next.


// Test Patterns 
// We're learning an important testing pattern here:

// Arrange → Act → Assert
// Arrange
//    ↓
// prepare fake data/dependencies

// Act
//    ↓
// call the method we're testing

// Assert
//    ↓
// verify the result

// This is the standard pattern you'll see in Java/Spring tests.