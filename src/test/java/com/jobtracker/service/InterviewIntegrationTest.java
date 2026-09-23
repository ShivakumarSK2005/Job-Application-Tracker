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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.security.test.context.support.WithMockUser;

@SpringBootTest
@AutoConfigureMockMvc
class InterviewIntegrationTest {

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

        User user = new User(
                "John",
                "john@gmail.com",
                "password123"
        );

        userRepository.save(user);
    }

    private JobApplication createJob() {

        User user = userRepository
                .findByEmail("john@gmail.com")
                .orElseThrow();

        JobApplication job = new JobApplication(
                null,
                "Google",
                "Software Engineer",
                "Bangalore",
                ApplicationStatus.INTERVIEW,
                LocalDate.of(2026, 9, 20)
        );

        job.setUserId(user.getId());

        return jobRepository.save(job);
    }

    @Test
    @WithMockUser(username = "john@gmail.com")
    void createInterview_shouldCreateSuccessfully() throws Exception {

        JobApplication job = createJob();

        String requestBody = """
                {
                    "interviewDate": "2026-09-25",
                    "round": "Technical Round",
                    "type": "Online",
                    "interviewer": "John",
                    "result": "Pending"
                }
                """;

        mockMvc.perform(
                post("/api/jobs/" + job.getId() + "/interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.jobApplicationId")
                .value(job.getId()))
        .andExpect(jsonPath("$.round")
                .value("Technical Round"))
        .andExpect(jsonPath("$.type")
                .value("Online"));
    }

    @Test
    @WithMockUser(username = "john@gmail.com")
    void getInterviews_shouldReturnInterviews() throws Exception {

        JobApplication job = createJob();

        Interview interview = new Interview(
                job.getId(),
                LocalDate.of(2026, 9, 25),
                "Technical Round",
                "Online",
                "John",
                "Pending"
        );

        interviewRepository.save(interview);

        mockMvc.perform(
                get("/api/jobs/" + job.getId() + "/interviews")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].jobApplicationId")
                .value(job.getId()))
        .andExpect(jsonPath("$[0].round")
                .value("Technical Round"));
    }

    @Test
    @WithMockUser(username = "john@gmail.com")
    void updateInterview_shouldUpdateSuccessfully() throws Exception {

        JobApplication job = createJob();

        Interview interview = new Interview(
                job.getId(),
                LocalDate.of(2026, 9, 25),
                "Technical Round",
                "Online",
                "John",
                "Pending"
        );

        Interview saved =
                interviewRepository.save(interview);

        String requestBody = """
                {
                    "interviewDate": "2026-09-27",
                    "round": "HR Round",
                    "type": "Offline",
                    "interviewer": "David",
                    "result": "Selected"
                }
                """;

        mockMvc.perform(
                put("/api/jobs/" + job.getId()
                        + "/interviews/" + saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.round")
                .value("HR Round"))
        .andExpect(jsonPath("$.type")
                .value("Offline"))
        .andExpect(jsonPath("$.result")
                .value("Selected"));
    }

    @Test
    @WithMockUser(username = "john@gmail.com")
    void deleteInterview_shouldDeleteSuccessfully() throws Exception {

        JobApplication job = createJob();

        Interview interview = new Interview(
                job.getId(),
                LocalDate.of(2026, 9, 25),
                "Technical Round",
                "Online",
                "John",
                "Pending"
        );

        Interview saved =
                interviewRepository.save(interview);

        mockMvc.perform(
                delete("/api/jobs/" + job.getId()
                        + "/interviews/" + saved.getId())
        )
        .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "john@gmail.com")
    void createInterview_shouldRejectInvalidRequest() throws Exception {

        JobApplication job = createJob();

        String requestBody = """
                {
                    "interviewDate": null,
                    "round": "",
                    "type": ""
                }
                """;

        mockMvc.perform(
                post("/api/jobs/" + job.getId() + "/interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
        .andExpect(status().isBadRequest());
    }
}