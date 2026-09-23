package com.jobtracker.repository;

import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.JobApplication;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
class JobRepositoryTest {

    @Autowired
    private JobRepository jobRepository;

    @BeforeEach
    void setUp() {
        jobRepository.deleteAll();
    }


    // =========================================================
    // findByUserId
    // =========================================================

    @Test
    void findByUserId_shouldReturnOnlyUsersJobs() {

        JobApplication job1 = new JobApplication(
                null,
                "Google",
                "Software Engineer",
                "Bangalore",
                ApplicationStatus.APPLIED,
                LocalDate.of(2026, 9, 20)
        );

        job1.setUserId("user123");

        JobApplication job2 = new JobApplication(
                null,
                "Microsoft",
                "Backend Engineer",
                "Bangalore",
                ApplicationStatus.INTERVIEW,
                LocalDate.of(2026, 9, 21)
        );

        job2.setUserId("user456");

        jobRepository.save(job1);
        jobRepository.save(job2);

        var result = jobRepository.findByUserId(
                "user123",
                org.springframework.data.domain.PageRequest.of(0, 10)
        );

        assertThat(result.getContent())
                .hasSize(1);

        assertThat(result.getContent().get(0).getCompany())
                .isEqualTo("Google");
    }


    // =========================================================
    // findByIdAndUserId
    // =========================================================

    @Test
    void findByIdAndUserId_shouldReturnUsersJob() {

        JobApplication job = new JobApplication(
                null,
                "Amazon",
                "Backend Developer",
                "Hyderabad",
                ApplicationStatus.APPLIED,
                LocalDate.of(2026, 9, 20)
        );

        job.setUserId("user123");

        JobApplication saved =
                jobRepository.save(job);

        var result =
                jobRepository.findByIdAndUserId(
                        saved.getId(),
                        "user123"
                );

        assertThat(result)
                .isPresent();

        assertThat(result.get().getCompany())
                .isEqualTo("Amazon");
    }


    // =========================================================
    // findByIdAndUserId - wrong user
    // =========================================================

    @Test
    void findByIdAndUserId_shouldNotReturnAnotherUsersJob() {

        JobApplication job = new JobApplication(
                null,
                "Google",
                "Software Engineer",
                "Bangalore",
                ApplicationStatus.APPLIED,
                LocalDate.of(2026, 9, 20)
        );

        job.setUserId("user123");

        JobApplication saved =
                jobRepository.save(job);

        var result =
                jobRepository.findByIdAndUserId(
                        saved.getId(),
                        "user456"
                );

        assertThat(result)
                .isEmpty();
    }


    // =========================================================
    // countByUserId
    // =========================================================

    @Test
    void countByUserId_shouldReturnCorrectCount() {

        JobApplication job1 = new JobApplication(
                null,
                "Google",
                "SWE",
                "Bangalore",
                ApplicationStatus.APPLIED,
                LocalDate.of(2026, 9, 20)
        );

        job1.setUserId("user123");

        JobApplication job2 = new JobApplication(
                null,
                "Microsoft",
                "SWE",
                "Bangalore",
                ApplicationStatus.INTERVIEW,
                LocalDate.of(2026, 9, 21)
        );

        job2.setUserId("user123");

        jobRepository.save(job1);
        jobRepository.save(job2);

        long count =
                jobRepository.countByUserId("user123");

        assertThat(count)
                .isEqualTo(2);
    }


    // =========================================================
    // countByUserIdAndStatus
    // =========================================================

    @Test
    void countByUserIdAndStatus_shouldReturnCorrectCount() {

        JobApplication job1 = new JobApplication(
                null,
                "Google",
                "SWE",
                "Bangalore",
                ApplicationStatus.APPLIED,
                LocalDate.of(2026, 9, 20)
        );

        job1.setUserId("user123");

        JobApplication job2 = new JobApplication(
                null,
                "Microsoft",
                "SWE",
                "Bangalore",
                ApplicationStatus.INTERVIEW,
                LocalDate.of(2026, 9, 21)
        );

        job2.setUserId("user123");

        JobApplication job3 = new JobApplication(
                null,
                "Amazon",
                "SWE",
                "Hyderabad",
                ApplicationStatus.APPLIED,
                LocalDate.of(2026, 9, 22)
        );

        job3.setUserId("user123");

        jobRepository.save(job1);
        jobRepository.save(job2);
        jobRepository.save(job3);

        long count =
                jobRepository.countByUserIdAndStatus(
                        "user123",
                        ApplicationStatus.APPLIED
                );

        assertThat(count)
                .isEqualTo(2);
    }
}