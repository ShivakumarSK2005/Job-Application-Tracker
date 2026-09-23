# Job Application Tracker Backend API

A robust, production-ready Spring Boot REST API for tracking and managing job applications, interview schedules, and job search metrics. Built with Spring Boot 3, Spring Security with JWT authentication, and MongoDB Atlas.

---

## 🚀 Features

- **🔐 Authentication & Security**:
  - User registration and login with BCrypt password hashing.
  - Stateless JWT (JSON Web Token) authentication with custom filter chain.
  - User-isolated job and interview records.

- **💼 Job Application Management**:
  - Full CRUD operations for job applications (`APPLIED`, `INTERVIEW`, `SELECTED`, `REJECTED`, etc.).
  - Search and filter by company, status, and role.
  - Server-side pagination and dynamic multi-field sorting.

- **📅 Interview Scheduling & Tracking**:
  - Schedule and manage interviews linked to applications.
  - Track interview rounds, dates, feedback, and outcomes.

- **📊 Dashboard & Metrics**:
  - Aggregated statistics (total applications, active interviews, offers, rejection rates).

- **🛡️ Validation & Exception Handling**:
  - Centralized global exception handler (`@ControllerAdvice`).
  - Standardized error response formats with descriptive error messages.
  - Input validation using Jakarta Bean Validation (`@Valid`, `@NotBlank`, etc.).

---

## 🛠️ Tech Stack

- **Java**: 21
- **Framework**: Spring Boot 3.3.4
- **Security**: Spring Security 6, JJWT (io.jsonwebtoken 0.12.6)
- **Database**: MongoDB / MongoDB Atlas (Spring Data MongoDB)
- **Validation**: Jakarta Validation API & Hibernate Validator
- **Testing**: JUnit 5, Mockito 5.18, Spring Boot Test
- **Build Tool**: Maven

---

## 📂 Project Architecture

```
com.jobtracker
├── controller          # REST API endpoints (Auth, Job, Interview, Dashboard)
├── dto                 # Request & Response Data Transfer Objects
├── exception           # Custom exceptions & GlobalExceptionHandler
├── model               # MongoDB Documents / Entities (User, JobApplication, Interview)
├── repository          # Spring Data MongoDB repositories
├── security            # SecurityConfig, JwtAuthenticationFilter
└── service             # Business logic & JWT token management
```

### Request Flow
```
HTTP Request ──► JwtFilter ──► Controller ──► Service ──► Repository ──► MongoDB
                                     │            │
                                     ▼            ▼
                                 DTO Validation  DTO Mapping
```

---

## ⚙️ Getting Started

### Prerequisites
- **JDK 21** or later
- **Maven** (or use the included `./mvnw` wrapper)
- A **MongoDB** instance (local or MongoDB Atlas connection URI)

### Setup & Configuration

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShivakumarSK2005/Job-Application-Tracker.git
   cd Job-Application-Tracker
   ```

2. **Configure Environment Variables:**
   Configure `application.properties` or set environment variables:
   ```properties
   spring.application.name=jobtracker
   server.port=8080

   # MongoDB Atlas / Local URI
   spring.mongodb.uri=${MONGODB_URI:mongodb+srv://<username>:<password>@cluster0.mongodb.net/jobtracker?retryWrites=true&w=majority}

   # JWT Secret Key
   jwt.secret=${JWT_SECRET:your-super-secret-key-for-job-tracker-application-123456}
   jwt.expiration=86400000
   ```

3. **Run the Application:**
   Using Maven wrapper:
   ```bash
   # On Windows PowerShell / CMD:
   .\mvnw.cmd spring-boot:run

   # On Linux / macOS:
   ./mvnw spring-boot:run
   ```

   The server will start at `http://localhost:8080`.

---

## 🧪 Running Tests

To run unit and integration test suites:
```bash
.\mvnw.cmd test
```

---

## 📡 API Overview

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | ❌ No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | ❌ No |

### 2. Job Applications (`/api/jobs`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/jobs` | Get paginated applications (supports `page`, `size`, `sort`, `company`, `status`) | ✅ Bearer JWT |
| `GET` | `/api/jobs/{id}` | Get application by ID | ✅ Bearer JWT |
| `POST` | `/api/jobs` | Create a new job application | ✅ Bearer JWT |
| `PUT` | `/api/jobs/{id}` | Update existing application | ✅ Bearer JWT |
| `PATCH` | `/api/jobs/{id}/status` | Update application status | ✅ Bearer JWT |
| `DELETE` | `/api/jobs/{id}` | Delete an application | ✅ Bearer JWT |

### 3. Interviews (`/api/interviews`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/interviews` | Get scheduled interviews | ✅ Bearer JWT |
| `POST` | `/api/interviews` | Schedule a new interview | ✅ Bearer JWT |
| `PUT` | `/api/interviews/{id}` | Update interview details | ✅ Bearer JWT |
| `DELETE` | `/api/interviews/{id}` | Cancel/delete interview | ✅ Bearer JWT |

### 4. Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard` | Get high-level application metrics & statistics | ✅ Bearer JWT |

> For comprehensive request/response payloads, cURL examples, and testing notes, see [`docs/APIs.txt`](docs/APIs.txt) and [`docs/Testing.txt`](docs/Testing.txt).

---

## 💻 Frontend Application (Trackr Pro)

A modern, high-craft web client built with React 18, Vite, and Tailwind CSS. Designed with an enterprise-grade aesthetic (Linear/Ashby inspired) featuring:
- **Dual View Modes**: Interactive **Kanban Pipeline Board** with quick stage transitions and **Enterprise Data Table** with sorting, search, and server-side pagination.
- **Full Application Lifecycle**: Create, edit, status patching, and delete jobs.
- **Embedded Interview Hub**: Schedule, edit, and track multi-round technical and behavioral interviews per job application with visual timeline.
- **Pipeline Metrics & Funnel**: Real-time KPI cards and proportional pipeline distribution.
- **Authentication**: JWT authentication with automatic request interceptors, session restoration, and validation.
- **Dark & Light Mode**: Built-in high-contrast theme toggle with persistence.

### Running the Frontend:

```bash
cd frontend
npm.cmd install
npm.cmd run dev
```

The frontend will run at `http://localhost:5173` with automatic reverse proxy to `http://localhost:8080`.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).