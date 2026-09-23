package com.jobtracker.service;

import com.jobtracker.dto.DashboardResponse;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.User;
import com.jobtracker.repository.JobRepository;
import com.jobtracker.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public DashboardService(
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    public DashboardResponse getDashboard() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String userId = user.getId();

        return new DashboardResponse(

                jobRepository.countByUserId(userId),

                jobRepository.countByUserIdAndStatus(
                        userId,
                        ApplicationStatus.APPLIED
                ),

                jobRepository.countByUserIdAndStatus(
                        userId,
                        ApplicationStatus.ONLINE_ASSESSMENT
                ),

                jobRepository.countByUserIdAndStatus(
                        userId,
                        ApplicationStatus.INTERVIEW
                ),

                jobRepository.countByUserIdAndStatus(
                        userId,
                        ApplicationStatus.SELECTED
                ),

                jobRepository.countByUserIdAndStatus(
                        userId,
                        ApplicationStatus.REJECTED
                )
        );
    }
}