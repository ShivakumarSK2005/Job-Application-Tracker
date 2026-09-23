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
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JobIntegrationTest {

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

        User user = new User(
                "John",
                "john@gmail.com",
                "password123"
        );

        userRepository.save(user);
    }

    @Test
    @WithMockUser(username = "john@gmail.com")
    void createJob_shouldCreateJobSuccessfully() throws Exception {

        String requestBody = """
                {
                    "company": "Google",
                    "role": "Software Engineer",
                    "location": "Bangalore",
                    "status": "APPLIED",
                    "appliedDate": "2026-09-20"
                }
                """;

        mockMvc.perform(
                post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.company")
                .value("Google"))
        .andExpect(jsonPath("$.role")
                .value("Software Engineer"))
        .andExpect(jsonPath("$.location")
                .value("Bangalore"))
        .andExpect(jsonPath("$.status")
                .value("APPLIED"));
    }

    @Test
    @WithMockUser(username = "john@gmail.com")
    void getJobs_shouldReturnUserJobs() throws Exception {

        User user = userRepository
                .findByEmail("john@gmail.com")
                .orElseThrow();

        JobApplication job = new JobApplication(
                null,
                "Microsoft",
                "Software Engineer",
                "Hyderabad",
                ApplicationStatus.INTERVIEW,
                LocalDate.of(2026, 9, 18)
        );

        job.setUserId(user.getId());

        jobRepository.save(job);

        mockMvc.perform(
                get("/api/jobs")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].company")
                .value("Microsoft"))
        .andExpect(jsonPath("$.content[0].role")
                .value("Software Engineer"))
        .andExpect(jsonPath("$.content[0].status")
                .value("INTERVIEW"));
    }
}