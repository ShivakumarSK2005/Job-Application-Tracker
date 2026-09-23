package com.jobtracker.repository;

import com.jobtracker.model.Interview;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
class InterviewRepositoryTest {

    @Autowired
    private InterviewRepository interviewRepository;

    @BeforeEach
    void setUp() {
        interviewRepository.deleteAll();
    }


    // =========================================================
    // findByJobApplicationId
    // =========================================================

    @Test
    void findByJobApplicationId_shouldReturnInterviewsForJob() {

        Interview interview1 = new Interview(
                "job123",
                LocalDate.of(2026, 9, 25),
                "Technical Round",
                "Online",
                "John",
                "Pending"
        );

        Interview interview2 = new Interview(
                "job123",
                LocalDate.of(2026, 9, 27),
                "HR Round",
                "Online",
                "David",
                "Pending"
        );

        Interview interview3 = new Interview(
                "job456",
                LocalDate.of(2026, 9, 28),
                "Technical Round",
                "Offline",
                "Mike",
                "Pending"
        );

        interviewRepository.save(interview1);
        interviewRepository.save(interview2);
        interviewRepository.save(interview3);

        List<Interview> result =
                interviewRepository.findByJobApplicationId("job123");

        assertThat(result)
                .hasSize(2);

        assertThat(result)
                .extracting(Interview::getJobApplicationId)
                .containsOnly("job123");
    }


    // =========================================================
    // findByIdAndJobApplicationId
    // =========================================================

    @Test
    void findByIdAndJobApplicationId_shouldReturnInterview() {

        Interview interview = new Interview(
                "job123",
                LocalDate.of(2026, 9, 25),
                "Technical Round",
                "Online",
                "John",
                "Pending"
        );

        Interview saved =
                interviewRepository.save(interview);

        var result =
                interviewRepository.findByIdAndJobApplicationId(
                        saved.getId(),
                        "job123"
                );

        assertThat(result)
                .isPresent();

        assertThat(result.get().getRound())
                .isEqualTo("Technical Round");

        assertThat(result.get().getJobApplicationId())
                .isEqualTo("job123");
    }


    // =========================================================
    // findByIdAndJobApplicationId - wrong job
    // =========================================================

    @Test
    void findByIdAndJobApplicationId_shouldNotReturnInterviewForWrongJob() {

        Interview interview = new Interview(
                "job123",
                LocalDate.of(2026, 9, 25),
                "Technical Round",
                "Online",
                "John",
                "Pending"
        );

        Interview saved =
                interviewRepository.save(interview);

        var result =
                interviewRepository.findByIdAndJobApplicationId(
                        saved.getId(),
                        "job456"
                );

        assertThat(result)
                .isEmpty();
    }


    // =========================================================
    // Multiple interviews for different jobs
    // =========================================================

    @Test
    void findByJobApplicationId_shouldSeparateDifferentJobs() {

        Interview job1Interview = new Interview(
                "job123",
                LocalDate.of(2026, 9, 25),
                "Technical",
                "Online",
                "John",
                "Pending"
        );

        Interview job2Interview = new Interview(
                "job456",
                LocalDate.of(2026, 9, 26),
                "HR",
                "Offline",
                "David",
                "Selected"
        );

        interviewRepository.save(job1Interview);
        interviewRepository.save(job2Interview);

        List<Interview> result =
                interviewRepository.findByJobApplicationId("job456");

        assertThat(result)
                .hasSize(1);

        assertThat(result.get(0).getRound())
                .isEqualTo("HR");
    }
}