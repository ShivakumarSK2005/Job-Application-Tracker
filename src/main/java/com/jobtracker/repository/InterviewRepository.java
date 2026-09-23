package com.jobtracker.repository;

import com.jobtracker.model.Interview;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

//Optional is used to handle the case where an interview with the given ID and Application ID may not exist in the database. it can hold atmost one value, either a value or null. It is used to represent the presence or absence of a value.
import java.util.Optional;

public interface InterviewRepository
        extends MongoRepository<Interview, String> {
    // Find INterviews by Applicaiton ID -> an Application can have multiple interviews, so we return a List of Interviews.
    List<Interview> findByJobApplicationId(String jobApplicationId);
    // Find an Interview by its Interview ID and the associated Job Application ID. this return one value becuse there exist one interview with the given ID and job ID. If no such interview exists, it returns an empty Optional.
    // Optional can hold AtMost one value, either a value or null. It is used to represent the presence or absence of a value.
    Optional<Interview> findByIdAndJobApplicationId(
            String interviewId,
            String jobId
    );
}

// Find all interviews for application 101 -> 0, 1, many,   So  List<Interview>
// Find interview with ID I1 belonging to application 101 -> 0 or 1 , So  Optional<Interview>

// List<T>       → multiple values
// Optional<T>   → zero or one value

// What does Optional mean?
// It means:
// "There may or may not be a value."

// What does findByJobApplicationId method do?

// List<Interview> findByJobApplicationId(String jobApplicationId); -> means:
// Find all interviews whose jobApplicationId matches the given job ID.

// So if a job has multiple interviews:

// Google Job
//    │
//    ├── Technical Round
//    ├── HR Round
//    └── Manager Round

// MongoDB can store three separate Interview documents, all containing the same:

// jobApplicationId
// Why List?

// Because one job can have multiple interviews.

// JobApplication 1
//       ↓
// Interview 1
// Interview 2
// Interview 3

// So: