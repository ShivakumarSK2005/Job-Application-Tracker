package com.jobtracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.dto.LoginRequest;
import com.jobtracker.dto.LoginResponse;
import com.jobtracker.dto.UserRequest;
import com.jobtracker.dto.UserResponse;
import com.jobtracker.service.AuthService;
import com.jobtracker.service.JwtService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(TestSecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;


    // =========================================================
    // POST /api/auth/register
    // =========================================================

    @Test
    void register_shouldRegisterSuccessfully() throws Exception {

        UserRequest request = new UserRequest();

        request.setName("Shivakumar");
        request.setEmail("shiva@gmail.com");
        request.setPassword("password123");

        UserResponse response =
                new UserResponse(
                        "user123",
                        "Shivakumar",
                        "shiva@gmail.com"
                );

        when(authService.register(any(UserRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                objectMapper.writeValueAsString(request)
                        )
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value("user123"))
        .andExpect(jsonPath("$.name")
                .value("Shivakumar"))
        .andExpect(jsonPath("$.email")
                .value("shiva@gmail.com"));

        verify(authService)
                .register(any(UserRequest.class));
    }


    // =========================================================
    // POST /api/auth/register - validation
    // =========================================================

    @Test
    void register_shouldRejectInvalidRequest() throws Exception {

        UserRequest request = new UserRequest();

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                objectMapper.writeValueAsString(request)
                        )
        )
        .andExpect(status().isBadRequest());

        verify(authService, never())
                .register(any(UserRequest.class));
    }


    // =========================================================
    // POST /api/auth/login
    // =========================================================

    @Test
    void login_shouldLoginSuccessfully() throws Exception {

        LoginRequest request = new LoginRequest();

        request.setEmail("shiva@gmail.com");
        request.setPassword("password123");

        LoginResponse response =
                new LoginResponse(
                        "jwt-token-123"
                );

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                objectMapper.writeValueAsString(request)
                        )
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token")
                .value("jwt-token-123"));

        verify(authService)
                .login(any(LoginRequest.class));
    }


    // =========================================================
    // POST /api/auth/login - validation
    // =========================================================

    @Test
    void login_shouldRejectInvalidRequest() throws Exception {

        LoginRequest request = new LoginRequest();

        mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                objectMapper.writeValueAsString(request)
                        )
        )
        .andExpect(status().isBadRequest());

        verify(authService, never())
                .login(any(LoginRequest.class));
    }
}
