// // Saving Data Locally Using ArrayList

// package com.jobtracker.service;

// import com.jobtracker.model.JobApplication;
// import org.springframework.stereotype.Service;

// import com.jobtracker.exception.JobNotFoundException;

// import java.util.Iterator;
// import java.util.ArrayList;
// import java.util.List;
// // DTO
// import com.jobtracker.dto.JobResponse;

// @Service
// public class JobService {

//     private final List<JobApplication> jobs = new ArrayList<>();

// // // Get All Applications - Without DTO
// //     public List<JobApplication> getAllJobs() {
// //         return jobs;
// //     }

//     // With DTO
//     public List<JobResponse> getAllJobs() {

//         List<JobResponse> responses = new ArrayList<>();

//         for (JobApplication job : jobs) {

//             JobResponse response = new JobResponse(
//                     job.getId(),
//                     job.getCompany(),
//                     job.getRole(),
//                     job.getLocation(),
//                     job.getStatus()
//             );

//             responses.add(response);
//         }

//         return responses;
//     }

// // // Create a New Application - Without DTO
// //     public JobApplication createJob(JobApplication job) {

// //         job.setId((long) (jobs.size() + 1));
// //         jobs.add(job);

// //         return job;
// //     }

// //  Create a New Application - With DTO
//     public JobResponse createJob(JobApplication job) {

//         job.setId(String.valueOf(jobs.size() + 1));
//         jobs.add(job);

//         return new JobResponse(
//                 job.getId(),
//                 job.getCompany(),
//                 job.getRole(),
//                 job.getLocation(),
//                 job.getStatus()
//         );
//     }

//     // Update the Application - Without DTO
//     // public JobApplication updateJob(Long id, JobApplication updatedJob) {

//     //     for (JobApplication job : jobs) {

//     //         if (job.getId().equals(id)) {

//     //             job.setCompany(updatedJob.getCompany());
//     //             job.setRole(updatedJob.getRole());
//     //             job.setLocation(updatedJob.getLocation());
//     //             job.setStatus(updatedJob.getStatus());

//     //             return job;
//     //         }
//     //     }

//     //     return null;
//     // }

    
//     // Update the Application - With DTO
//         public JobResponse updateJob(String id, JobApplication updatedJob) {

//         for (JobApplication job : jobs) {

//             if (job.getId().equals(id)) {

//                 job.setCompany(updatedJob.getCompany());
//                 job.setRole(updatedJob.getRole());
//                 job.setLocation(updatedJob.getLocation());
//                 job.setStatus(updatedJob.getStatus());

//                 return new JobResponse(
//                         job.getId(),
//                         job.getCompany(),
//                         job.getRole(),
//                         job.getLocation(),
//                         job.getStatus()
//                 );
//             }
//         }

//         throw new JobNotFoundException(id);
//     }

//     // Delete the Application
//     public void deleteJob(String id) {

//         Iterator<JobApplication> iterator = jobs.iterator();

//         while (iterator.hasNext()) {

//             JobApplication job = iterator.next();

//             if (job.getId().equals(id)) {
//                 iterator.remove();
//                 return;
//             }
//         }

//         throw new JobNotFoundException(id);
//     }

// }


// Connecting form Local to MongoDB Atlas

package com.jobtracker.service;

import com.jobtracker.dto.JobResponse;
import com.jobtracker.exception.JobNotFoundException;
import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.JobApplication;
import com.jobtracker.repository.JobRepository;
import com.jobtracker.dto.StatusUpdateRequest;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;

// Pagination
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

//
import com.jobtracker.model.User;
import com.jobtracker.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

//Mongo Templete
// Dynamic filtering with MongoTemplate
// Instead of having repository methods for every combination of:
// company + role + status
// company + status
// role + status
// ...

// we'll let MongoDB build the query dynamically.
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
//
import org.springframework.data.domain.PageImpl;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    // Without JWT
    // public JobService(JobRepository jobRepository) {
    //     this.jobRepository = jobRepository;
    // }

    // With JWT
    public JobService(
            JobRepository jobRepository,
            UserRepository userRepository,
            MongoTemplate mongoTemplate) {

        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
                this.mongoTemplate = mongoTemplate;
    }
    
    // With JWT -> getting User 
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    // GET
    public List<JobResponse> getAllJobs() {

        List<JobApplication> jobs = jobRepository.findAll();

        List<JobResponse> responses = new ArrayList<>();

        for (JobApplication job : jobs) {

                JobResponse response = toResponse(job);

            responses.add(response);
        }

        return responses;
    }

    // Get Job By id  - Without JWT 
    //     public JobResponse getJobById(String id) {

    //     JobApplication job = jobRepository.findById(id)
    //             .orElseThrow(() -> new JobNotFoundException(id));

    //     return toResponse(job);
    // } 

    // Get Job By id  - With JWT 
    public JobResponse getJobById(String id) {

        User user = getCurrentUser();

        JobApplication job =
                jobRepository.findByIdAndUserId(
                        id,
                        user.getId()
                )
                .orElseThrow(() ->
                        new JobNotFoundException(id));

        return new JobResponse(
                job.getId(),
                job.getCompany(),
                job.getRole(),
                job.getUserId(),
                job.getLocation(),
                job.getStatus(),
                job.getAppliedDate()
        );
    }

    // Search Job By Company
    public List<JobResponse> searchByCompany(String company) {
        return getJobs(company, null, null, Pageable.unpaged())
                .getContent();
    }
    //Search Job By Status
    public List<JobResponse> searchByStatus(ApplicationStatus status) {
        return getJobs(null, null, status, Pageable.unpaged())
                .getContent();
    }
    //Search Job By Company and Status
    public List<JobResponse> searchByCompanyAndStatus(
            String company,
            ApplicationStatus status) {

        return getJobs(company, null, status, Pageable.unpaged())
                .getContent();
    }

    // // Get Jobs with Pagination - Getting JobApplication objects
    // so we dont want to return JobApplication objects directly to the client, we will convert them to JobResponse objects in the controller layer.
    // public Page<JobApplication> getJobs(
    //         String company,
    //         ApplicationStatus status,
    //         Pageable pageable) {

    //     if (company != null && status != null) {
    //         return jobRepository.findByCompanyAndStatus(
    //                 company, status, pageable);
    //     }

    //     if (company != null) {
    //         return jobRepository.findByCompany(
    //                 company, pageable);
    //     }

    //     if (status != null) {
    //         return jobRepository.findByStatus(
    //                 status, pageable);
    //     }

    //     return jobRepository.findAll(pageable);
    // }


    // Get Jobs with Pagination - Getting JobResponse objects
    // so we dont want to return JobApplication objects directly to the client, we will convert them to JobResponse objects in the service layer.
    // Without JWT 
    //     public Page<JobResponse> getJobs(
    //         String company,
    //         ApplicationStatus status,
    //         Pageable pageable) {

    //     Page<JobApplication> jobs;

    //     if (company != null && status != null) {
    //         jobs = jobRepository.findByCompanyAndStatus(
    //                 company, status, pageable);

    //     } else if (company != null) {
    //         jobs = jobRepository.findByCompany(
    //                 company, pageable);

    //     } else if (status != null) {
    //         jobs = jobRepository.findByStatus(
    //                 status, pageable);

    //     } else {
    //         jobs = jobRepository.findAll(pageable);
    //     }

    //     return jobs.map(this::toResponse);
    // }

    // With JWT + Mongo Templete
    public Page<JobResponse> getJobs(
            String company,
            String role,
            ApplicationStatus status,
            Pageable pageable) {

        User user = getCurrentUser();

        Query query = new Query();

        // Always restrict jobs to current user
        query.addCriteria(
                Criteria.where("userId").is(user.getId())
        );

        // Company filter
        if (company != null && !company.isBlank()) {
            query.addCriteria(
                    Criteria.where("company")
                            .regex(company, "i")
            );
        }

        // Role filter
        if (role != null && !role.isBlank()) {
            query.addCriteria(
                    Criteria.where("role")
                            .regex(role, "i")
            );
        }

        // Status filter
        if (status != null) {
            query.addCriteria(
                    Criteria.where("status")
                            .is(status)
            );
        }

        // Total count before pagination
        long total = mongoTemplate.count(
                query,
                JobApplication.class
        );

        // Apply pagination + sorting
        query.with(pageable);

        List<JobApplication> jobs =
                mongoTemplate.find(
                        query,
                        JobApplication.class
                );

        List<JobResponse> responses =
                jobs.stream()
                        .map(job -> new JobResponse(
                                job.getId(),
                                job.getCompany(),
                                job.getRole(),
                                job.getUserId(),
                                job.getLocation(),
                                job.getStatus(),
                                job.getAppliedDate()
                        ))
                        .toList();

        return new PageImpl<>(
                responses,
                pageable,
                total
        );
    }

    private JobResponse toResponse(JobApplication job) {
        return new JobResponse(
                job.getId(),
                job.getCompany(),
                job.getRole(),
                job.getUserId(),
                job.getLocation(),
                job.getStatus(),
                job.getAppliedDate()
        );
    }

    // POST - Without JWT
    // public JobResponse createJob(JobApplication job) {

    //     JobApplication savedJob = jobRepository.save(job);

    //     return toResponse(savedJob);
    // }

    // POST - With JWT
    public JobResponse createJob(JobApplication job) {

        if (job.getAppliedDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Applied date cannot be in the future"
            );
        }

        User user = getCurrentUser();

        job.setUserId(user.getId());

        JobApplication savedJob = jobRepository.save(job);

        return new JobResponse(
            savedJob.getId(),
            savedJob.getCompany(),
            savedJob.getRole(),
            savedJob.getUserId(),
            savedJob.getLocation(),
            savedJob.getStatus(),
            savedJob.getAppliedDate()
        );
    }

    // // PUT - Update Job Without JWT
    // public JobResponse updateJob(String id, JobApplication updatedJob) {

    //     JobApplication existingJob = jobRepository.findById(id)
    //             .orElseThrow(() -> new JobNotFoundException(id));

    //     existingJob.setCompany(updatedJob.getCompany());
    //     existingJob.setRole(updatedJob.getRole());
    //     existingJob.setLocation(updatedJob.getLocation());
    //     existingJob.setStatus(updatedJob.getStatus());
    //     existingJob.setAppliedDate(updatedJob.getAppliedDate());

    //     JobApplication savedJob = jobRepository.save(existingJob);

    //     return toResponse(savedJob);
    // }

    // // PUT - Update Job With JWT
    public JobResponse updateJob(
            String id,
            JobApplication updatedJob) {

        if (updatedJob.getAppliedDate()
                .isAfter(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Applied date cannot be in the future"
            );
        }        

        User user = getCurrentUser();

        JobApplication existing =
                jobRepository.findByIdAndUserId(
                        id,
                        user.getId()
                )
                .orElseThrow(() ->
                        new JobNotFoundException(id));

        existing.setCompany(updatedJob.getCompany());
        existing.setRole(updatedJob.getRole());
        existing.setLocation(updatedJob.getLocation());
        existing.setStatus(updatedJob.getStatus());
        existing.setAppliedDate(updatedJob.getAppliedDate());

        JobApplication saved =
                jobRepository.save(existing);

        return new JobResponse(
            saved.getId(),
            saved.getCompany(),
            saved.getRole(),
            saved.getUserId(),
            saved.getLocation(),
            saved.getStatus(),
            saved.getAppliedDate()
        );
    }

    // // Delete Job - Without JWT
    // public void deleteJob(String id) {

    //     if (!jobRepository.existsById(id)) {
    //         throw new JobNotFoundException(id);
    //     }

    //     jobRepository.deleteById(id);
    // }

    // Delete Job - With JWT
    public void deleteJob(String id) {

        User user = getCurrentUser();

        JobApplication job =
                jobRepository.findByIdAndUserId(
                        id,
                        user.getId()
                )
                .orElseThrow(() ->
                        new JobNotFoundException(id));

        jobRepository.delete(job);
    }

    // Updating the status of a job application - With DTO Without JWT
    // public JobResponse updateStatus(
    //         String id,
    //         ApplicationStatus status) {

    //     JobApplication job = jobRepository.findById(id)
    //             .orElseThrow(() -> new JobNotFoundException(id));

    //     job.setStatus(status);

    //     JobApplication savedJob = jobRepository.save(job);

    //     return toResponse(savedJob);
    // }

    // Updating the status of a job application - With DTO With JWT
    public JobResponse updateStatus(
            String id,
            ApplicationStatus status) {

        User user = getCurrentUser();

        JobApplication job =
                jobRepository.findByIdAndUserId(
                        id,
                        user.getId()
                )
                .orElseThrow(() ->
                        new JobNotFoundException(id));

        job.setStatus(status);

        JobApplication saved =
                jobRepository.save(job);

        return new JobResponse(
            saved.getId(),
            saved.getCompany(),
            saved.getRole(),
            saved.getUserId(),
            saved.getLocation(),
            saved.getStatus(),
            saved.getAppliedDate()
        );
    }



}


// // Working After Connecting to MongoDB Atlas

// What changed?

// Previously:

// POST
//  ↓
// Service
//  ↓
// ArrayList

// Now:

// POST
//  ↓
// Controller
//  ↓
// Service
//  ↓
// JobRepository
//  ↓
// MongoDB Atlas

// For example:

// jobRepository.save(job);

// Spring Data MongoDB takes that Java object and stores it as a MongoDB document