# Course & Class Management Feature

## Overview
The Course and Class modules handle curriculum definitions and their physical (or virtual) occurrences. Courses serve as the blueprint (e.g., "Math 101"), while Classes represent specific sections (e.g., "Math 101 - Fall 2026").

## Architecture

### Entities
1. **Course**:
   - Stores metadata: `code`, `name`, `description`, `credits`, `prerequisites`, `syllabusUrl`, `status`.
   - Relationships: Created by a `User` (`@ManyToOne`). Has many `Classes` (`@OneToMany`).
2. **Class**:
   - Stores scheduling metadata: `className`, `capacity`, `semester`, `startDate`, `endDate`, `schedule` (JSON), `enrolledCount`, `status`.
   - Relationships: Belongs to a `Course` (`@ManyToOne`). Led by a `Facilitator` (`@ManyToOne`).

## Implemented Endpoints

### Courses
**Base Route:** `/courses`

| Method | Route | Roles | Description |
|---|---|---|---|
| POST | `/` | ADMIN | Creates a new Course. Connects `req.user` to track the creator. |
| GET | `/` | USER | Lists all courses. |
| GET | `/:id` | USER | Retrieves course details. |
| PATCH | `/:id` | ADMIN | Updates a course (Course code cannot be modified). |
| DELETE | `/:id` | ADMIN | Hard deletes a course. |
| PATCH | `/:id/archive` | ADMIN | Archives a course. |

### Classes
**Base Route:** `/classes`

| Method | Route | Roles | Description |
|---|---|---|---|
| POST | `/` | ADMIN, MANAGER | Creates a new Class instance. |
| GET | `/` | USER | Lists all classes. |
| GET | `/:id` | USER | Retrieves class details. |
| PATCH | `/:id` | ADMIN, MANAGER | Updates a class (courseId, semester, and dates cannot be modified). |
| PATCH | `/:id/status` | ADMIN, MANAGER | Transitions the class status (e.g., `ACTIVE`, `COMPLETED`, `CANCELLED`). |

*Note: Enrollment operations (`/:id/students`, `/:id/enroll`) and Attendance operations have mocked routes ready for Phase 2 implementation.*

## Key Technical Decisions
1. **Integer Primary Keys**: Retained auto-incrementing integers for `Course` and `Class` (instead of UUIDs) to ensure strict relational consistency with `User` and `Student` entities.
2. **Restricted Updates**: 
   - `UpdateCourseDto` utilizes `OmitType` to strictly prohibit changes to the `code`.
   - `UpdateClassDto` utilizes `OmitType` to strictly prohibit changes to `courseId`, `semester`, `startDate`, and `endDate`.
3. **Data Protection**: Implemented enum checks before saving database statuses to prevent TypeScript type erasure vulnerabilities at runtime.
