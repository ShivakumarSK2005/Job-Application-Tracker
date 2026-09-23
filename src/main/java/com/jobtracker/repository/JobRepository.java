package com.jobtracker.repository;

import com.jobtracker.model.JobApplication;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

import com.jobtracker.model.ApplicationStatus;

// Pagination
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

// Optional
import java.util.Optional;


// public interface JobRepository extends MongoRepository<JobApplication, String> {

//     List<JobApplication> findByCompany(String company);

//     List<JobApplication> findByStatus(ApplicationStatus status);

//     List<JobApplication> findByCompanyAndStatus(
//             String company,
//             ApplicationStatus status
//     );
// }

// // Before JWT
// public interface JobRepository extends MongoRepository<JobApplication, String> {

//         List<JobApplication> findByCompany(String company);

//         List<JobApplication> findByStatus(ApplicationStatus status);

//         List<JobApplication> findByCompanyAndStatus(
//                         String company,
//                         ApplicationStatus status
//         );

//     Page<JobApplication> findByCompany(
//             String company,
//             Pageable pageable
//     );

//     Page<JobApplication> findByStatus(
//             ApplicationStatus status,
//             Pageable pageable
//     );

//     Page<JobApplication> findByCompanyAndStatus(
//             String company,
//             ApplicationStatus status,
//             Pageable pageable
//     );
// }

// After JWT
// public interface JobRepository extends MongoRepository<JobApplication, String> {

//         long countByUserId(String userId);

//         long countByUserIdAndStatus(
//                         String userId,
//                         ApplicationStatus status
//         );

//     Page<JobApplication> findByUserId(
//             String userId,
//             Pageable pageable
//     );

//     Page<JobApplication> findByUserIdAndCompany(
//             String userId,
//             String company,
//             Pageable pageable
//     );

//     Page<JobApplication> findByUserIdAndStatus(
//             String userId,
//             ApplicationStatus status,
//             Pageable pageable
//     );

//     Page<JobApplication> findByUserIdAndCompanyAndStatus(
//             String userId,
//             String company,
//             ApplicationStatus status,
//             Pageable pageable
//     );

//     Optional<JobApplication> findByIdAndUserId(
//             String id,
//             String userId
//     );
// }


// cleaner filtering + role search + case-insensitive search + pagination defaults + sorting.
// public interface JobRepository extends MongoRepository<JobApplication, String> {

//     Page<JobApplication> findByUserId(
//             String userId,
//             Pageable pageable
//     );

//     Page<JobApplication> findByUserIdAndCompanyContainingIgnoreCase(
//             String userId,
//             String company,
//             Pageable pageable
//     );

//     Page<JobApplication> findByUserIdAndRoleContainingIgnoreCase(
//             String userId,
//             String role,
//             Pageable pageable
//     );

//     Page<JobApplication> findByUserIdAndStatus(
//             String userId,
//             ApplicationStatus status,
//             Pageable pageable
//     );

//     Page<JobApplication>
//     findByUserIdAndCompanyContainingIgnoreCaseAndStatus(
//             String userId,
//             String company,
//             ApplicationStatus status,
//             Pageable pageable
//     );

//     Page<JobApplication>
//     findByUserIdAndRoleContainingIgnoreCaseAndStatus(
//             String userId,
//             String role,
//             ApplicationStatus status,
//             Pageable pageable
//     );

//     Optional<JobApplication> findByIdAndUserId(
//             String id,
//             String userId
//     );

//     long countByUserId(String userId);

//     long countByUserIdAndStatus(
//             String userId,
//             ApplicationStatus status
//     );
// }

// New One with - MongoTemplete
public interface JobRepository
        extends MongoRepository<JobApplication, String> {

    Page<JobApplication> findByUserId(
            String userId,
            Pageable pageable
    );

    Optional<JobApplication> findByIdAndUserId(
            String id,
            String userId
    );

    long countByUserId(String userId);

    long countByUserIdAndStatus(
            String userId,
            ApplicationStatus status
    );
}












