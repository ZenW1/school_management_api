# Feature: Student Management

## Overview
The Student Management module is the central hub for managing student data. It handles everything from registration and profile management to academic tracking and document storage. It strictly adheres to REST API standards and role-based access.

## Core Capabilities
* **Profile Management:** Stores and manages personal information, deeply linking the `Student` entity to the core `User` entity via a One-to-One relationship.
* **Advanced Search:** Allows searching for students by their name or their associated user email through a unified TypeORM QueryBuilder.
* **Document Management:** Tracks uploaded student documents (IDs, Certificates, Qualifications). Allows document uploading via API and maintains verification statuses (`PENDING`, `VERIFIED`, `REJECTED`).
* **Academic Tracking (Mocks):** Includes API skeleton endpoints for retrieving courses, grades, and attendance, prepped for integration with future modules.
* **Role-Based Access:** All endpoints are protected. Only `ADMIN` and `MANAGER` can create or delete students, while `STUDENT` users can view and update their own data.

## Database Entities
- **Student (`src/student/entity/student.entity.ts`):** Contains personal details, GPA, enrollment date, and links to the `User` entity.
- **DocumentUpload (`src/student/entity/document-upload.entity.ts`):** Stores references to uploaded files, linked to the student's User ID.

## API Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/students` | List and search all students | Admin, Manager |
| `POST` | `/students` | Create student profile (auto-creates User account via email/password) | Admin, Manager |
| `GET` | `/students/:id` | Get student details | Admin, Manager, Student |
| `PATCH` | `/students/:id` | Update student profile | Admin, Manager, Student |
| `DELETE`| `/students/:id` | Deactivate student | Admin, Manager |
| `GET` | `/students/:id/courses` | Get enrolled courses (Mock) | Admin, Manager, Student |
| `GET` | `/students/:id/grades` | Get student grades (Mock) | Admin, Manager, Student |
| `GET` | `/students/:id/attendance`| Get attendance (Mock) | Admin, Manager, Student |
| `POST` | `/students/:id/documents`| Upload a document | Admin, Manager, Student |
| `GET` | `/students/:id/documents`| Retrieve uploaded documents | Admin, Manager, Student |

## Key Files
- `src/student/student.module.ts`: Registers the module and its entities.
- `src/student/student.controller.ts`: Handles HTTP routing and Guard validation.
- `src/student/student.service.ts`: Core business logic for profiles and document uploads.
