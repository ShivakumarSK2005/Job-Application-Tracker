package com.jobtracker.integration;

import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.User;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JobSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {

        jobRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "user1@gmail.com")
    void getJobs_shouldReturnOnlyCurrentUsersJobs() throws Exception {

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

        JobApplication job1 = new JobApplication(
                null,
                "Google",
                "Software Engineer",
                "Bangalore",
                ApplicationStatus.APPLIED,
                LocalDate.of(2026, 9, 20)
        );

        job1.setUserId(user1.getId());

        JobApplication job2 = new JobApplication(
                null,
                "Microsoft",
                "Software Engineer",
                "Hyderabad",
                ApplicationStatus.INTERVIEW,
                LocalDate.of(2026, 9, 21)
        );

        job2.setUserId(user2.getId());

        jobRepository.save(job1);
        jobRepository.save(job2);

        mockMvc.perform(
                get("/api/jobs")
        )
        .andExpect(status().isOk())
        .andExpect(result ->
                org.assertj.core.api.Assertions.assertThat(
                        result.getResponse().getContentAsString()
                )
                .contains("Google")
                .doesNotContain("Microsoft")
        );
    }

    @Test
    @WithMockUser(username = "user1@gmail.com")
    void getAnotherUsersJob_shouldReturnNotFound() throws Exception {

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
                ApplicationStatus.APPLIED,
                LocalDate.of(2026, 9, 20)
        );

        job.setUserId(user2.getId());

        JobApplication savedJob = jobRepository.save(job);

        mockMvc.perform(
                get("/api/jobs/" + savedJob.getId())
        )
        .andExpect(status().isNotFound());
    }
}