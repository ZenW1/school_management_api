# Feature: Assessment & Grading

## Overview
This module handles the entire evaluation lifecycle—from creating assignments to submitting work, grading, and computing final GPAs.

## Core Capabilities
* **Assignments:** Create assignments, exams, and quizzes with due dates.
* **Submissions:** Track student submissions and statuses.
* **Grading System:** Enter scores, calculate weights, and provide feedback.
* **Analytics:** Compute GPAs, generate progress reports, and view grade distributions.

## Database Schema (PostgreSQL)
\`\`\`sql
Assignments
├── id (UUID, PK)
├── classId (FK -> Classes)
├── title
├── description
├── dueDate
├── maxScore
├── createdBy (FK -> Facilitators)

Submissions
├── id (UUID, PK)
├── assignmentId (FK -> Assignments)
├── studentId (FK -> Students)
├── submissionUrl
├── submittedAt
├── status (ENUM: SUBMITTED, GRADED, PENDING)

Grades
├── id (UUID, PK)
├── studentId (FK -> Students)
├── classId (FK -> Classes)
├── assignmentId (FK -> Assignments, nullable)
├── score
├── maxScore
├── weight
├── feedback
├── gradedBy (FK -> Facilitators)
\`\`\`

## API Endpoints
* `POST /assignments` - Create assignment (Facilitator)
* `GET /assignments` - List assignments
* `GET /assignments/:id` - Get assignment details
* `POST /submissions` - Submit assignment (Student)
* `GET /submissions/:id` - Get submission details
* `POST /grades` - Submit grade (Facilitator)
* `GET /students/:id/grades` - Get student grades
* `GET /classes/:id/grades` - Get class grade report
