# Feature: Course & Class Management

## Overview
This module links the academic framework (Courses) with logistical execution (Classes). It ensures smooth scheduling, enrollment tracking, and timetable management.

## Core Capabilities
* **Course Configuration:** Create courses, set prerequisites, credits, and syllabus.
* **Class Scheduling:** Assign facilitators, set timetables, and map rooms.
* **Capacity Controls:** Enforce maximum student capacity per class.
* **Attendance Tracking:** Record attendance for both students and facilitators.
* **Lifecycle Management:** Update status (active, completed, cancelled, upcoming).

## Database Schema (PostgreSQL)
\`\`\`sql
Courses
├── id (UUID, PK)
├── code (UNIQUE)
├── name
├── description
├── credits
├── prerequisites
├── syllabusUrl
├── status (ENUM: ACTIVE, INACTIVE, ARCHIVED)

Classes
├── id (UUID, PK)
├── courseId (FK -> Courses)
├── facilitatorId (FK -> Facilitators)
├── className
├── capacity
├── schedule (JSON: day, startTime, endTime, room)
├── semester
├── startDate/endDate
├── status (ENUM: ACTIVE, COMPLETED, CANCELLED, UPCOMING)

Enrollments
├── id (UUID, PK)
├── studentId (FK -> Students)
├── classId (FK -> Classes)
├── enrollmentDate
├── status (ENUM: ACTIVE, COMPLETED, DROPPED)

Attendance
├── id (UUID, PK)
├── classId (FK -> Classes)
├── studentId (FK -> Students)
├── date
├── status (ENUM: PRESENT, ABSENT, LATE, EXCUSED)
\`\`\`

## API Endpoints
### Courses
* `GET /courses` - List all courses
* `POST /courses` - Create course (Admin)
* `GET /courses/:id` - Get course details
* `PATCH /courses/:id` - Update course
* `DELETE /courses/:id` - Archive course

### Classes & Attendance
* `GET /classes` - List all classes
* `POST /classes` - Create class (Admin)
* `GET /classes/:id` - Get class details
* `PATCH /classes/:id` - Update class
* `GET /classes/:id/students` - Get enrolled students
* `POST /classes/:id/enroll` - Enroll student
* `DELETE /classes/:id/students/:studentId` - Remove student
* `GET /classes/:id/attendance` - Get class attendance records
* `POST /classes/:id/attendance` - Mark attendance
