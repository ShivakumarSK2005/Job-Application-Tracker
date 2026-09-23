package com.jobtracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.dto.InterviewRequest;
import com.jobtracker.dto.InterviewResponse;
import com.jobtracker.service.InterviewService;
import com.jobtracker.service.JwtService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InterviewController.class)
@Import(TestSecurityConfig.class)
class InterviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InterviewService interviewService;

    @MockBean
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;


    // =========================================================
    // POST /api/jobs/{jobId}/interviews
    // =========================================================

    @Test
    void createInterview_shouldCreateSuccessfully() throws Exception {

        InterviewRequest request = new InterviewRequest();

        request.setInterviewDate(LocalDate.of(2026, 9, 25));
        request.setRound("Technical Round");
        request.setType("Online");
        request.setInterviewer("John");
        request.setResult("Pending");

        InterviewResponse response =
                new InterviewResponse(
                        "interview123",
                        "job123",
                        LocalDate.of(2026, 9, 25),
                        "Technical Round",
                        "Online",
                        "John",
                        "Pending"
                );

        when(interviewService.createInterview(
                eq("job123"),
                any(InterviewRequest.class)
        )).thenReturn(response);

        mockMvc.perform(
                post("/api/jobs/job123/interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                objectMapper.writeValueAsString(request)
                        )
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value("interview123"))
        .andExpect(jsonPath("$.jobApplicationId")
                .value("job123"))
        .andExpect(jsonPath("$.round")
                .value("Technical Round"))
        .andExpect(jsonPath("$.type")
                .value("Online"))
        .andExpect(jsonPath("$.interviewer")
                .value("John"));

        verify(interviewService)
                .createInterview(
                        eq("job123"),
                        any(InterviewRequest.class)
                );
    }


    // =========================================================
    // POST validation
    // =========================================================

    @Test
    void createInterview_shouldRejectInvalidRequest() throws Exception {

        InterviewRequest request = new InterviewRequest();

        mockMvc.perform(
                post("/api/jobs/job123/interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                objectMapper.writeValueAsString(request)
                        )
        )
        .andExpect(status().isBadRequest());

        verify(interviewService, never())
                .createInterview(
                        anyString(),
                        any(InterviewRequest.class)
                );
    }


    // =========================================================
    // GET /api/jobs/{jobId}/interviews
    // =========================================================

    @Test
    void getInterviews_shouldReturnSuccessfully() throws Exception {

        InterviewResponse interview =
                new InterviewResponse(
                        "interview123",
                        "job123",
                        LocalDate.of(2026, 9, 25),
                        "Technical Round",
                        "Online",
                        "John",
                        "Pending"
                );

        when(interviewService.getInterviewsByJobId("job123"))
                .thenReturn(List.of(interview));

        mockMvc.perform(
                get("/api/jobs/job123/interviews")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id")
                .value("interview123"))
        .andExpect(jsonPath("$[0].jobApplicationId")
                .value("job123"))
        .andExpect(jsonPath("$[0].round")
                .value("Technical Round"))
        .andExpect(jsonPath("$[0].type")
                .value("Online"));

        verify(interviewService)
                .getInterviewsByJobId("job123");
    }


    // =========================================================
    // PUT /api/jobs/{jobId}/interviews/{interviewId}
    // =========================================================

    @Test
    void updateInterview_shouldUpdateSuccessfully() throws Exception {

        InterviewRequest request = new InterviewRequest();

        request.setInterviewDate(LocalDate.of(2026, 9, 30));
        request.setRound("Final Round");
        request.setType("Offline");
        request.setInterviewer("David");
        request.setResult("Selected");

        InterviewResponse response =
                new InterviewResponse(
                        "interview123",
                        "job123",
                        LocalDate.of(2026, 9, 30),
                        "Final Round",
                        "Offline",
                        "David",
                        "Selected"
                );

        when(interviewService.updateInterview(
                eq("job123"),
                eq("interview123"),
                any(InterviewRequest.class)
        )).thenReturn(response);

        mockMvc.perform(
                put("/api/jobs/job123/interviews/interview123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                objectMapper.writeValueAsString(request)
                        )
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value("interview123"))
        .andExpect(jsonPath("$.round")
                .value("Final Round"))
        .andExpect(jsonPath("$.result")
                .value("Selected"));

        verify(interviewService)
                .updateInterview(
                        eq("job123"),
                        eq("interview123"),
                        any(InterviewRequest.class)
                );
    }


    // =========================================================
    // DELETE /api/jobs/{jobId}/interviews/{interviewId}
    // =========================================================

    @Test
    void deleteInterview_shouldDeleteSuccessfully() throws Exception {

        doNothing()
                .when(interviewService)
                .deleteInterview(
                        "job123",
                        "interview123"
                );

        mockMvc.perform(
                delete("/api/jobs/job123/interviews/interview123")
        )
        .andExpect(status().isOk());

        verify(interviewService)
                .deleteInterview(
                        "job123",
                        "interview123"
                );
    }
}