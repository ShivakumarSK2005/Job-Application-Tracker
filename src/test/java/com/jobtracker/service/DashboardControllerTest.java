package com.jobtracker.controller;

import com.jobtracker.dto.DashboardResponse;
import com.jobtracker.service.DashboardService;
import com.jobtracker.service.JwtService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DashboardController.class)
@Import(TestSecurityConfig.class)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @MockBean
    private JwtService jwtService;


    // =========================================================
    // GET /api/dashboard
    // =========================================================

    @Test
    void getDashboard_shouldReturnDashboardSuccessfully()
            throws Exception {

        DashboardResponse response =
                new DashboardResponse(
                        10,
                        4,
                        2,
                        2,
                        1,
                        1
                );

        when(dashboardService.getDashboard())
                .thenReturn(response);

        mockMvc.perform(
                get("/api/dashboard")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalApplications")
                .value(10))
        .andExpect(jsonPath("$.applied")
                .value(4))
        .andExpect(jsonPath("$.onlineAssessments")
                .value(2))
        .andExpect(jsonPath("$.interviews")
                .value(2))
        .andExpect(jsonPath("$.selected")
                .value(1))
        .andExpect(jsonPath("$.rejected")
                .value(1));

        verify(dashboardService)
                .getDashboard();
    }
}