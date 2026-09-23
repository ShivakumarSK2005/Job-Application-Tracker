package com.jobtracker.integration;

import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.Interview;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.User;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobRepository;
import com.jobtracker.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InterviewSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @BeforeEach
    void setUp() {
        interviewRepository.deleteAll();
        jobRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "user1@gmail.com")
    void getInterviews_shouldRejectAnotherUsersJob() throws Exception {

        User user1 = new User(
                "User One",
                "user1@gmail.com",
                "password123"
        );

        User user2 = new User(
                "User Two",
                "user2@gmail.com",
                "password123"
        );

        userRepository.save(user1);
        userRepository.save(user2);

        JobApplication job = new JobApplication(
                null,
                "Microsoft",
                "Software Engineer",
                "Hyderabad",
                ApplicationStatus.INTERVIEW,
                LocalDate.of(2026, 9, 20)
        );

        job.setUserId(user2.getId());

        JobApplication savedJob =
                jobRepository.save(job);

        mockMvc.perform(
                get("/api/jobs/" + savedJob.getId() + "/interviews")
        )
        .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "user1@gmail.com")
    void deleteInterview_shouldRejectAnotherUsersJob() throws Exception {

        User user1 = new User(
                "User One",
                "user1@gmail.com",
                "password123"
        );

        User user2 = new User(
                "User Two",
                "user2@gmail.com",
                "password123"
        );

        userRepository.save(user1);
        userRepository.save(user2);

        JobApplication job = new JobApplication(
                null,
                "Amazon",
                "Backend Developer",
                "Chennai",
                ApplicationStatus.INTERVIEW,
                LocalDate.of(2026, 9, 20)
        );

        job.setUserId(user2.getId());

        JobApplication savedJob =
                jobRepository.save(job);

        Interview interview = new Interview(
                savedJob.getId(),
                LocalDate.of(2026, 9, 25),
                "Technical Round",
                "Online",
                "John",
                "Pending"
        );

        Interview savedInterview =
                interviewRepository.save(interview);

        mockMvc.perform(
                delete("/api/jobs/" + savedJob.getId()
                        + "/interviews/" + savedInterview.getId())
        )
        .andExpect(status().isNotFound());
    }
}