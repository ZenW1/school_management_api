# Feature: Student Management

## Overview
The Student Management module is the central hub for managing student data. It handles everything from registration and profile management to academic tracking and document storage.

## Core Capabilities
* **Profile Management:** Store and manage personal information (name, email, phone, address, DOB).
* **Academic Tracking:** Monitor GPA, current courses, grades, and attendance records.
* **Enrollment History:** Track current course enrollments and enrollment dates.
* **Guardian Details:** Maintain Parent/Guardian contact information.
* **Document Management:** Upload and manage sensitive documents like IDs and certificates.

## Database Schema (PostgreSQL)
\`\`\`sql
Users (Base Table)
├── id (UUID, PK)
├── email (UNIQUE)
├── password (hashed)
├── fullName
├── phone
├── role (ENUM: STUDENT, FACILITATOR, MANAGER, ADMIN)
├── isActive

Students
├── id (UUID, PK)
├── userId (FK -> Users)
├── enrollmentDate
├── parentName
├── parentPhone
├── address
├── dateOfBirth
├── gpa
├── status (ENUM: ACTIVE, INACTIVE, GRADUATED, SUSPENDED)

DocumentUploads
├── id (UUID, PK)
├── userId (FK -> Users)
├── documentType (ENUM: ID, CERTIFICATE, QUALIFICATION, OTHER)
├── fileUrl
├── verificationStatus (ENUM: PENDING, VERIFIED, REJECTED)
\`\`\`

## API Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/students` | List all students | Admin/Manager |
| `POST` | `/students` | Create student profile | Admin/Manager |
| `GET` | `/students/:id` | Get student details | Admin/Manager/Owner |
| `PATCH` | `/students/:id` | Update student profile | Admin/Manager/Owner |
| `DELETE`| `/students/:id` | Deactivate student | Admin/Manager |
| `GET` | `/students/:id/courses` | Get enrolled courses | Admin/Manager/Owner |
| `GET` | `/students/:id/grades` | Get student grades | Admin/Manager/Owner |
| `GET` | `/students/:id/attendance` | Get attendance record | Admin/Manager/Owner |
