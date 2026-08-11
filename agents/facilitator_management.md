# Feature: Facilitator Management

## Overview
This module is dedicated to the school's teaching staff. It allows administrators to onboard facilitators, manage their credentials, and assign them to respective classes and subjects.

## Core Capabilities
* **Profile & Credentials:** Manage registration, specializations, and qualifications.
* **Scheduling:** View and manage class assignments and availability calendars.
* **Academic Controls:** Submit grades and track student performance.
* **Attendance:** Mark and manage class attendance.
* **Document Management:** Securely store teaching certificates and qualifications.

## Database Schema (PostgreSQL)
\`\`\`sql
Facilitators
├── id (UUID, PK)
├── userId (FK -> Users)
├── specialization
├── qualification
├── hireDate
├── department
├── status (ENUM: ACTIVE, INACTIVE, ON_LEAVE)
\`\`\`

## API Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/facilitators` | List all facilitators | Admin/Manager/Student |
| `POST` | `/facilitators` | Create facilitator profile | Admin/Manager |
| `GET` | `/facilitators/:id` | Get facilitator details | Admin/Manager/Owner |
| `PATCH` | `/facilitators/:id` | Update facilitator profile | Admin/Manager/Owner |
| `DELETE`| `/facilitators/:id` | Deactivate facilitator | Admin/Manager |
| `GET` | `/facilitators/:id/classes` | Get assigned classes | Admin/Manager/Owner |
| `GET` | `/facilitators/:id/students`| Get students in assigned classes | Admin/Owner |
