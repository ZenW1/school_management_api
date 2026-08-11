# Feature: Learning Materials Management

## Overview
A centralized repository for all educational content. This module allows facilitators to upload resources and ensures students have continuous access to their study materials.

## Core Capabilities
* **File Management:** Upload PDFs, videos, and documents.
* **Organization:** Categorize by course, topic, and week.
* **Access Control:** Restrict visibility (Public, Private, Restricted).
* **Discoverability:** Search and filter capabilities for students.

## Database Schema (PostgreSQL)
\`\`\`sql
LearningMaterials
├── id (UUID, PK)
├── courseId (FK -> Courses)
├── title
├── description
├── fileUrl
├── fileType (ENUM: PDF, VIDEO, DOCUMENT, IMAGE)
├── uploadedBy (FK -> Users)
├── uploadDate
├── week (optional: Week number)
├── topic
├── visibility (ENUM: PUBLIC, PRIVATE, RESTRICTED)
\`\`\`

## API Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/materials` | List materials (with filters) | All Authenticated |
| `POST` | `/materials` | Upload material | Facilitator/Admin |
| `GET` | `/materials/:id` | Get material details | All Authenticated |
| `PATCH` | `/materials/:id` | Update material metadata | Facilitator/Admin |
| `DELETE`| `/materials/:id` | Delete material | Facilitator/Admin |
| `GET` | `/courses/:courseId/materials` | Get course materials | Enrolled/Admin |
| `POST` | `/materials/:id/download` | Download material | Enrolled/Admin |
