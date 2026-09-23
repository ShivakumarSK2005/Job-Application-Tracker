package com.jobtracker.integration;

import com.jobtracker.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void register_shouldCreateUserSuccessfully() throws Exception {

        String requestBody = """
                {
                    "name": "John",
                    "email": "john@gmail.com",
                    "password": "password123"
                }
                """;

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name")
                .value("John"))
        .andExpect(jsonPath("$.email")
                .value("john@gmail.com"));
    }

    @Test
    void register_shouldRejectDuplicateEmail() throws Exception {

        String requestBody = """
                {
                    "name": "John",
                    "email": "john@gmail.com",
                    "password": "password123"
                }
                """;

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
        .andExpect(status().isOk());

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
        )
        .andExpect(status().isConflict());
    }

    @Test
    void login_shouldReturnJwtToken() throws Exception {

        String registerRequest = """
                {
                    "name": "John",
                    "email": "john@gmail.com",
                    "password": "password123"
                }
                """;

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequest)
        )
        .andExpect(status().isOk());

        String loginRequest = """
                {
                    "email": "john@gmail.com",
                    "password": "password123"
                }
                """;

        mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token")
                .isNotEmpty());
    }

    @Test
    void login_shouldRejectWrongPassword() throws Exception {

        String registerRequest = """
                {
                    "name": "John",
                    "email": "john@gmail.com",
                    "password": "password123"
                }
                """;

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequest)
        )
        .andExpect(status().isOk());

        String loginRequest = """
                {
                    "email": "john@gmail.com",
                    "password": "wrongpassword"
                }
                """;

        mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest)
        )
        .andExpect(status().isUnauthorized());
    }
}