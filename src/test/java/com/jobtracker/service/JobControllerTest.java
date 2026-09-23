package com.jobtracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.dto.JobRequest;
import com.jobtracker.dto.JobResponse;
import com.jobtracker.dto.StatusUpdateRequest;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.service.JobService;
import com.jobtracker.service.JwtService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobController.class)
@Import(TestSecurityConfig.class)
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobService jobService;

    @MockBean
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;


    // =========================================================
    // GET /api/jobs
    // =========================================================

    @Test
    @WithMockUser
    void getJobs_shouldReturnJobsSuccessfully() throws Exception {

        JobResponse response = new JobResponse(
                "job123",
                "Google",
                "Software Engineer Intern",
                "user123",
                "Bangalore",
                ApplicationStatus.APPLIED,
                LocalDate.of(2026, 9, 20)
        );

        PageImpl<JobResponse> page =
                new PageImpl<>(
                        List.of(response),
                        PageRequest.of(0, 10),
                        1
                );

        when(jobService.getJobs(
                isNull(),
                isNull(),
                isNull(),
                any()
        )).thenReturn(page);

        mockMvc.perform(
                get("/api/jobs")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].id")
                .value("job123"))
        .andExpect(jsonPath("$.content[0].company")
                .value("Google"))
        .andExpect(jsonPath("$.content[0].role")
                .value("Software Engineer Intern"))
        .andExpect(jsonPath("$.content[0].location")
                .value("Bangalore"))
        .andExpect(jsonPath("$.content[0].status")
                .value("APPLIED"));

        verify(jobService).getJobs(
                isNull(),
                isNull(),
                isNull(),
                any()
        );
    }


    // =========================================================
    // GET /api/jobs/{id}
    // =========================================================

    @Test
    @WithMockUser
    void getJobById_shouldReturnJobSuccessfully() throws Exception {

        JobResponse response = new JobResponse(
                "job123",
                "Microsoft",
                "Backend Engineer Intern",
                "user123",
                "Bangalore",
                ApplicationStatus.INTERVIEW,
                LocalDate.of(2026, 9, 20)
        );

        when(jobService.getJobById("job123"))
                .thenReturn(response);

        mockMvc.perform(
                get("/api/jobs/job123")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value("job123"))
        .andExpect(jsonPath("$.company")
                .value("Microsoft"))
        .andExpect(jsonPath("$.role")
                .value("Backend Engineer Intern"))
        .andExpect(jsonPath("$.status")
                .value("INTERVIEW"));

        verify(jobService)
                .getJobById("job123");
    }


    // =========================================================
    // POST /api/jobs
    // =========================================================

    @Test
    @WithMockUser
    void createJob_shouldCreateJobSuccessfully() throws Exception {

        JobRequest request = new JobRequest();

        request.setCompany("Amazon");
        request.setRole("Software Engineer Intern");
        request.setLocation("Hyderabad");
        request.setStatus(ApplicationStatus.APPLIED);
        request.setAppliedDate(LocalDate.of(2026, 9, 20));

        JobResponse response = new JobResponse(
                "job123",
                "Amazon",
                "Software Engineer Intern",
                "user123",
                "Hyderabad",
                ApplicationStatus.APPLIED,
                LocalDate.of(2026, 9, 20)
        );

        when(jobService.createJob(any()))
                .thenReturn(response);

        mockMvc.perform(
                post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value("job123"))
        .andExpect(jsonPath("$.company")
                .value("Amazon"))
        .andExpect(jsonPath("$.role")
                .value("Software Engineer Intern"))
        .andExpect(jsonPath("$.location")
                .value("Hyderabad"))
        .andExpect(jsonPath("$.status")
                .value("APPLIED"));

        verify(jobService)
                .createJob(any());
    }


    // =========================================================
    // POST /api/jobs - Validation
    // =========================================================

    @Test
    @WithMockUser
    void createJob_shouldRejectInvalidRequest() throws Exception {

        JobRequest request = new JobRequest();

        // Everything required is missing

        mockMvc.perform(
                post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
        )
        .andExpect(status().isBadRequest());

        verify(jobService, never())
                .createJob(any());
    }


    // =========================================================
    // PUT /api/jobs/{id}
    // =========================================================

    @Test
    @WithMockUser
    void updateJob_shouldUpdateSuccessfully() throws Exception {

        JobRequest request = new JobRequest();

        request.setCompany("Microsoft");
        request.setRole("Backend Engineer");
        request.setLocation("Bangalore");
        request.setStatus(ApplicationStatus.INTERVIEW);
        request.setAppliedDate(LocalDate.of(2026, 9, 20));

        JobResponse response = new JobResponse(
                "job123",
                "Microsoft",
                "Backend Engineer",
                "user123",
                "Bangalore",
                ApplicationStatus.INTERVIEW,
                LocalDate.of(2026, 9, 20)
        );

        when(jobService.updateJob(
                eq("job123"),
                any()
        )).thenReturn(response);

        mockMvc.perform(
                put("/api/jobs/job123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value("job123"))
        .andExpect(jsonPath("$.company")
                .value("Microsoft"))
        .andExpect(jsonPath("$.status")
                .value("INTERVIEW"));

        verify(jobService)
                .updateJob(eq("job123"), any());
    }


    // =========================================================
    // DELETE /api/jobs/{id}
    // =========================================================

    @Test
    @WithMockUser
    void deleteJob_shouldDeleteSuccessfully() throws Exception {

        doNothing()
                .when(jobService)
                .deleteJob("job123");

        mockMvc.perform(
                delete("/api/jobs/job123")
        )
        .andExpect(status().isOk())
        .andExpect(content()
                .string("Job deleted successfully"));

        verify(jobService)
                .deleteJob("job123");
    }


    // =========================================================
    // PATCH /api/jobs/{id}/status
    // =========================================================

    @Test
    @WithMockUser
    void updateStatus_shouldUpdateSuccessfully() throws Exception {

        StatusUpdateRequest request =
                new StatusUpdateRequest();

        request.setStatus(ApplicationStatus.SELECTED);

        JobResponse response = new JobResponse(
                "job123",
                "Google",
                "Software Engineer",
                "user123",
                "Bangalore",
                ApplicationStatus.SELECTED,
                LocalDate.of(2026, 9, 20)
        );

        when(jobService.updateStatus(
                "job123",
                ApplicationStatus.SELECTED
        )).thenReturn(response);

        mockMvc.perform(
                patch("/api/jobs/job123/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value("job123"))
        .andExpect(jsonPath("$.status")
                .value("SELECTED"));

        verify(jobService)
                .updateStatus(
                        "job123",
                        ApplicationStatus.SELECTED
                );
    }


    // =========================================================
    // PATCH /api/jobs/{id}/status - Validation
    // =========================================================

    @Test
    @WithMockUser
    void updateStatus_shouldRejectInvalidRequest() throws Exception {

        StatusUpdateRequest request =
                new StatusUpdateRequest();

        mockMvc.perform(
                patch("/api/jobs/job123/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
        )
        .andExpect(status().isBadRequest());

        verify(jobService, never())
                .updateStatus(
                        anyString(),
                        any()
                );
    }
}