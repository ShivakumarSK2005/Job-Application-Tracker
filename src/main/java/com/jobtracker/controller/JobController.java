// // ----------------------------------------------------------------------------------------
//  // Stage 1 : Basic Spring Boot Application - NO Job Applications
// // ----------------------------------------------------------------------------------------

// package com.jobtracker.controller;

// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RestController;

// @RestController
// public class JobController {

//     @GetMapping("/api/jobs")
//     public String getJobs() {
//         return "Job Application Tracker API";
//     }
// }


// // ----------------------------------------------------------------------------------------
// // Stage 2 : Hard Coded Job Applications
// // ----------------------------------------------------------------------------------------

// // @GetMapping = GET /api/jobs
// // @RestController = this block of code is a REST API controller that handles HTTP requests and responses for job applications. It defines endpoints for retrieving job applications and creating new ones.

// package com.jobtracker.controller;

// import com.jobtracker.model.JobApplication;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RestController;

// import java.util.List;

// @RestController
// public class JobController {


//     @GetMapping("/api/jobs")
//     public List<JobApplication> getJobs() {

//         JobApplication job1 = new JobApplication(
//                 1L,
//                 "Microsoft",
//                 "Software Engineer Intern",
//                 "Bangalore",
//                 "APPLIED"
//         );

//         JobApplication job2 = new JobApplication(
//                 2L,
//                 "Google",
//                 "Software Engineer Intern",
//                 "Bangalore",
//                 "INTERVIEW"
//         );

//         JobApplication job3 = new JobApplication(
//             3L,
//             "Amazon",
//             "Backend Developer Intern",
//             "Hyderabad",
//             "APPLIED"
//         );

//         return List.of(job1, job2, job3);
//     }
// }


// // ----------------------------------------------------------------------------------------
// // Stage 3 : Job Applications Getting Using POST Rquest

// POST /api/jobs
//        ↓
//      JSON
//        ↓
// @RequestBody
//        ↓
// JobApplication
//        ↓
//      List


// GET /api/jobs
//        ↓
//    Controller
//        ↓
// List<JobApplication>
//        ↓
//       JSON


// Controller
//  ├── receive request
//  ├── create job
//  ├── store job
//  └── return response

// // ----------------------------------------------------------------------------------------

// // @GetMapping = GET /api/jobs
// // @PostMapping = POST /api/jobs

// package com.jobtracker.controller;

// import com.jobtracker.model.JobApplication;
// import org.springframework.web.bind.annotation.*;

// import java.util.ArrayList;
// import java.util.List;

// @RestController
// @RequestMapping("/api/jobs")
// public class JobController {

//     private final List<JobApplication> jobs = new ArrayList<>();

//     @GetMapping
//     public List<JobApplication> getJobs() {
//         return jobs;
//     }

//     @PostMapping
//     public JobApplication createJob(
//             @RequestBody JobApplication job) {

//         job.setId((long) (jobs.size() + 1));
//         jobs.add(job);

//         return job;
//     }
// }


// // ----------------------------------------------------------------------------------------
// // Stage 4 : Create the Service Layer

// // Client
//    ↓
// Controller
//    ↓
// Service
//    ↓
// Data source (later MongoDB)


// Controller
//  ├── receive request
//  └── call Service
//           ↓
//        JobService
//        ├── create job
//        ├── store job
//        └── return result

// // ----------------------------------------------------------------------------------------


// Hadling the PUT Request to update the job application status. 
// GET    /api/jobs       → get all jobs
// POST   /api/jobs       → create job
// PUT    /api/jobs/{id}  → update job
// DELETE /api/jobs/{id}  → delete job


// package com.jobtracker.controller;

// import com.jobtracker.model.JobApplication;
// import com.jobtracker.service.JobService;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;

// @RestController
// @RequestMapping("/api/jobs")
// public class JobController {

//     private final JobService jobService;

//     public JobController(JobService jobService) {
//         this.jobService = jobService;
//     }

//     @GetMapping
//     public List<JobApplication> getJobs() {
//         return jobService.getAllJobs();
//     }

//     @PostMapping
//     public JobApplication createJob(@RequestBody JobApplication job) {
//         return jobService.createJob(job);
//     }

//     @PutMapping("/{id}")
//     public JobApplication updateJob(
//             @PathVariable Long id,
//             @RequestBody JobApplication job) {

//         return jobService.updateJob(id, job);
//     }

//     @DeleteMapping("/{id}")
//     public String deleteJob(@PathVariable Long id) {

//         boolean deleted = jobService.deleteJob(id);

//         if (deleted) {
//             return "Job deleted successfully";
//         }

//         return "Job not found";
//     }

// }



// // ----------------------------------------------------------------------------------------
// // Stage 5 : Letting Job-Service to delete the job with proper exception handling.

// DELETE /api/jobs/100
//         ↓
// JobController
//         ↓
// JobService
//         ↓
// JobNotFoundException
//         ↓
// GlobalExceptionHandler
//         ↓
// 404 NOT FOUND

// // ----------------------------------------------------------------------------------------


package com.jobtracker.controller;

import java.util.List;

import com.jobtracker.model.ApplicationStatus;
import com.jobtracker.model.JobApplication;
import com.jobtracker.service.JobService;
import org.springframework.web.bind.annotation.*;
// DTO for status update request
import com.jobtracker.dto.StatusUpdateRequest;
// PatchMapping Annotation 
import org.springframework.web.bind.annotation.PatchMapping;
// Valid Annotation
import jakarta.validation.Valid;
// Get Jobs by many parameters like company, status, company and status, etc
import org.springframework.web.bind.annotation.RequestParam;

// Pagination
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

//DTO
import com.jobtracker.dto.JobRequest;
import com.jobtracker.dto.JobResponse;

// Simply: GET /api/jobs -> means: page = 0, size = 10 ,sort = appliedDate DESC
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // Without DTO
    // @GetMapping
    // public List<JobApplication> getJobs() {
    //     return jobService.getAllJobs();
    // }

    // With DTO
    // @GetMapping
    // public List<JobResponse> getJobs() {
    //     return jobService.getAllJobs();
    // }

    // Get Jobs by many parameters like company, status, company and status. If no parameters are provided, it will return all jobs.
    // @GetMapping 
    // public List<JobResponse> getJobs(
    //         @RequestParam(required = false) String company,
    //         @RequestParam(required = false) ApplicationStatus status) {

    //     if (company != null && status != null) {
    //         return jobService.searchByCompanyAndStatus(company, status);
    //     }

    //     if (company != null) {
    //         return jobService.searchByCompany(company);
    //     }

    //     if (status != null) {
    //         return jobService.searchByStatus(status);
    //     }

    //     return jobService.getAllJobs();
    // }

    // Get Jobs with pagination and by many parameters like company, status, company and status. If no parameters are provided, it will return all jobs.
    // we dont want to expose the JobApplication entity directly to the client, so we return jobresponse DTO instead of JobApplication entity. So, we need to convert the JobApplication entity to JobResponse DTO before returning it to the client.
    // @GetMapping
    // public Page<JobApplication> getJobs(
    //         @RequestParam(required = false) String company,
    //         @RequestParam(required = false) ApplicationStatus status,
    //         Pageable pageable) {

    //     return jobService.getJobs(company, status, pageable);
    // }

    // we are returning JobResponse DTO instead of JobApplication entity. So, we need to convert the JobApplication entity to JobResponse DTO before returning it to the client.
    // @GetMapping
    // public Page<JobResponse> getJobs(
    //         @RequestParam(required = false) String company,
    //         @RequestParam(required = false) ApplicationStatus status,
    //         Pageable pageable) {

    //     return jobService.getJobs(company, status, pageable);
    // }

    //
    @GetMapping
    public Page<JobResponse> getJobs(

            @RequestParam(required = false)
            String company,

            @RequestParam(required = false)
            String role,

            @RequestParam(required = false)
            ApplicationStatus status,

            @PageableDefault(
                    size = 10,
                    sort = "appliedDate",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        return jobService.getJobs(
                company,
                role,
                status,
                pageable
        );
    }

    // Get Job Application by ID - Without DTO
    @GetMapping("/{id}")
    public JobResponse getJobById(@PathVariable String id) {
        return jobService.getJobById(id);
    }

    // Without DTO
    // @PostMapping
    // public JobApplication createJob( @Valid @RequestBody JobApplication job) {
    //     return jobService.createJob(job);
    // }

    // With Request - DTO
    // @PostMapping
    // public JobApplication createJob(
    //         @Valid @RequestBody JobRequest request) {

    //     JobApplication job = new JobApplication();

    //     job.setCompany(request.getCompany());
    //     job.setRole(request.getRole());
    //     job.setLocation(request.getLocation());
    //     job.setStatus(request.getStatus());

    //     return jobService.createJob(job);
    // }

    // Search Job By Company
    @GetMapping("/search")
    public List<JobResponse> searchByCompany(
            @RequestParam String company) {

        return jobService.searchByCompany(company);
    }

    // Get job with Pagination
    @GetMapping("/page")
    public Page<JobResponse> getJobsWithPagination(Pageable pageable) {
        return jobService.getJobs(null, null, null, pageable);
    }

    //  With Request and Response - DTO
    @PostMapping
    public JobResponse createJob(
            @Valid @RequestBody JobRequest request) {

        JobApplication job = new JobApplication();

        job.setCompany(request.getCompany());
        job.setRole(request.getRole());
        job.setLocation(request.getLocation());
        job.setStatus(request.getStatus());
        job.setAppliedDate(request.getAppliedDate());
        job.setOaEventDate(request.getOaEventDate());
        job.setOaPlatform(request.getOaPlatform());
        job.setOaNotes(request.getOaNotes());
        job.setOaReminders(request.getOaReminders());

        return jobService.createJob(job);
    }

    // Update Job Application - With DTO
    @PutMapping("/{id}")
    public JobResponse updateJob(
            @PathVariable String id,
            @Valid @RequestBody JobRequest request) {

        JobApplication job = new JobApplication();

        job.setCompany(request.getCompany());
        job.setRole(request.getRole());
        job.setLocation(request.getLocation());
        job.setStatus(request.getStatus());
        job.setAppliedDate(request.getAppliedDate());
        job.setOaEventDate(request.getOaEventDate());
        job.setOaPlatform(request.getOaPlatform());
        job.setOaNotes(request.getOaNotes());
        job.setOaReminders(request.getOaReminders());

        return jobService.updateJob(id, job);
    }

    @DeleteMapping("/{id}")
    public String deleteJob(@PathVariable String id) {

        jobService.deleteJob(id);

        return "Job deleted successfully";
    }

    // Update Job Application Status - With DTO
    @PatchMapping("/{id}/status")
    public JobResponse updateStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequest request) {

        return jobService.updateStatus(
                id,
                request.getStatus(),
                request.getNotes()
        );
    }

}


// What does @Valid do?

// Think of the flow as:

// POST request
//      ↓
// JSON → JobApplication
//      ↓
//   @Valid
//      ↓
// Check @NotBlank rules
//      ↓
// Valid? ── Yes → Service
//    │
//    No
//    ↓
// 400 Bad Request


// Why DTO Do?
// Now your request can be:

// {
//   "id": 200,
//   "company": "Microsoft",
//   "role": "Backend Engineer Intern",
//   "location": "Bangalore",
//   "status": "INTERVIEW"
// }

// The id will simply be ignored, because JobRequest doesn't have an id field.

// Even better, send:

// {
//   "company": "Microsoft",
//   "role": "Backend Engineer Intern",
//   "location": "Bangalore",
//   "status": "INTERVIEW"
// }

// and the server generates the ID.

// The important concept
// Client
//    │
//    │ JSON
//    ↓
// JobRequest DTO
//    │
//    │ only allowed fields
//    ↓
// Controller
//    │
//    ↓
// JobApplication
//    │
//    ↓
// Service

// So:

// DTO = controls what the client can send.

// JobApplication = represents our actual application data.

// One more thing: for a proper project, we'll eventually also create a JobResponse DTO, so the entity/model isn't directly exposed in GET responses either.


// DTO
// POST → JobRequest → JobApplication → JobResponse
// PUT  → JobRequest → JobApplication → JobResponse
// GET  → JobApplication → JobResponse

// Get Jobs with many parameters like company, status, company and status. If no parameters are provided, it will return all jobs.
// /api/jobs
//         → all jobs

// /api/jobs?company=Google
//         → Google jobs

// /api/jobs?status=INTERVIEW
//         → Interview jobs

// /api/jobs?company=Google&status=INTERVIEW
//         → Google jobs with INTERVIEW status