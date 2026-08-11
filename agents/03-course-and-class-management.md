# 3. Course & Class Management Feature

## Overview
The Course & Class Management feature handles the creation and management of academic courses and specific class sections. Courses define the curriculum, while Classes are specific implementations with scheduling, facilitators, and students.

---

## Feature Scope

### Core Responsibilities
- Course creation and curriculum management
- Course metadata (code, prerequisites, credits, description)
- Class scheduling and configuration
- Facilitator assignment to classes
- Student capacity management
- Class status lifecycle
- Timetable management
- Course syllabus and material organization

### Key Entities

#### Course Entity
```typescript
@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  credits: number;

  @Column({ nullable: true })
  prerequisites: string;  // JSON string or comma-separated

  @Column({ nullable: true })
  syllabus: string;  // S3 URL or document path

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
    default: 'ACTIVE'
  })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => Class, classEntity => classEntity.course)
  classes: Class[];

  @OneToMany(() => LearningMaterial, material => material.course)
  materials: LearningMaterial[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Class Entity
```typescript
@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Course, { eager: true })
  @JoinColumn()
  course: Course;

  @ManyToOne(() => Facilitator, { eager: true })
  @JoinColumn()
  facilitator: Facilitator;

  @Column()
  className: string;  // e.g., "Section A", "Batch 2024"

  @Column()
  capacity: number;

  @Column({ type: 'json' })
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room?: string;
  }[];

  @Column({ nullable: true })
  semester: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'UPCOMING'],
    default: 'UPCOMING'
  })
  status: string;

  @OneToMany(() => Enrollment, enrollment => enrollment.class)
  enrollments: Enrollment[];

  @OneToMany(() => LearningMaterial, material => material.class, { nullable: true })
  materials?: LearningMaterial[];

  @Column({ type: 'int', default: 0 })
  enrolledCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## API Endpoints

### COURSE ENDPOINTS

### 1. List All Courses
**Endpoint:** `GET /courses`

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  status?: string;       // ACTIVE, INACTIVE, ARCHIVED
  search?: string;       // Search by name or code
  sortBy?: string;       // Default: createdAt
  sortOrder?: 'ASC' | 'DESC';
}
```

**Response:**
```typescript
{
  data: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

### 2. Create Course
**Endpoint:** `POST /courses`

**Request Body:**
```typescript
{
  code: string;              // Unique course code (e.g., "CS101")
  name: string;              // Course name
  description?: string;
  credits: number;           // Credit hours (typically 1-4)
  prerequisites?: string;    // Comma-separated course codes
  syllabusUrl?: string;      // S3 URL to syllabus PDF
}
```

**Validation Rules:**
- Course code must be unique and alphanumeric (e.g., "CS101", "MATH201")
- Course name required, 3-200 characters
- Credits must be 1-10
- Prerequisites must be valid course codes if specified

**Response:**
```typescript
{
  id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  prerequisites?: string;
  status: 'ACTIVE';
  createdAt: Date;
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Validation error
- `409 Conflict` - Course code already exists

---

### 3. Get Course Details
**Endpoint:** `GET /courses/:id`

**Response:**
```typescript
{
  id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  prerequisites?: string;
  status: string;
  classes: Class[];
  materials: LearningMaterial[];
  stats: {
    totalClasses: number;
    totalStudents: number;
    activeSections: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4. Update Course
**Endpoint:** `PATCH /courses/:id`

**Request Body:**
```typescript
{
  name?: string;
  description?: string;
  credits?: number;
  prerequisites?: string;
  syllabusUrl?: string;
}
```

**Note:** Course code cannot be changed once created

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Validation error
- `404 Not Found` - Course not found

---

### 5. Archive Course
**Endpoint:** `PATCH /courses/:id/archive`

**Description:** Mark course as archived (cannot be used for new classes)

**Business Rules:**
- Only ACTIVE courses can be archived
- Existing classes with this course remain unchanged
- Cannot create new classes for archived courses

**Response:**
```typescript
{
  id: string;
  status: 'ARCHIVED';
  archivedAt: Date;
}
```

---

### 6. Get Course Classes
**Endpoint:** `GET /courses/:id/classes`

**Query Parameters:**
```typescript
{
  semester?: string;
  status?: string;
  includeStudents?: boolean;
}
```

**Response:**
```typescript
{
  classes: Class[];
  summary: {
    totalClasses: number;
    activeClasses: number;
    totalEnrollments: number;
  };
}
```

---

### 7. Get Course Materials
**Endpoint:** `GET /courses/:id/materials`

**Query Parameters:**
```typescript
{
  week?: number;
  topic?: string;
  type?: string;  // PDF, VIDEO, DOCUMENT, IMAGE
}
```

**Response:**
```typescript
{
  materials: LearningMaterial[];
  grouped: {
    byWeek?: { [key: number]: LearningMaterial[] };
    byTopic?: { [key: string]: LearningMaterial[] };
  };
}
```

---

### CLASS ENDPOINTS

### 8. List All Classes
**Endpoint:** `GET /classes`

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  courseId?: string;
  facilitatorId?: string;
  status?: string;       // ACTIVE, COMPLETED, UPCOMING, CANCELLED
  semester?: string;
  search?: string;       // Search by className
  sortBy?: string;       // Default: startDate
}
```

**Response:**
```typescript
{
  data: Class[];
  total: number;
  page: number;
  limit: number;
}
```

---

### 9. Create Class
**Endpoint:** `POST /classes`

**Request Body:**
```typescript
{
  courseId: string;
  facilitatorId: string;
  className: string;             // e.g., "Section A", "Batch 2024"
  capacity: number;              // Max students
  semester: string;              // e.g., "Spring 2024"
  startDate: Date;
  endDate: Date;
  schedule: [
    {
      dayOfWeek: string;         // "Monday", "Tuesday", etc.
      startTime: string;         // "09:00" (24-hour format)
      endTime: string;           // "10:30"
      room?: string;             // "Room 101"
    }
  ];
}
```

**Validation Rules:**
- Course must exist and be ACTIVE
- Facilitator must exist and be ACTIVE
- Capacity must be 1-500
- Start date cannot be in past
- End date must be after start date
- Schedule times must be valid (start < end)
- No schedule conflicts for facilitator
- Class name must be unique per course per semester

**Response:**
```typescript
{
  id: string;
  course: { id: string; name: string; };
  facilitator: { id: string; user: { fullName: string; }; };
  className: string;
  capacity: number;
  enrolledCount: 0;
  status: 'UPCOMING';
  schedule: object[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Validation error
- `409 Conflict` - Schedule conflict or duplicate class name

---

### 10. Get Class Details
**Endpoint:** `GET /classes/:id`

**Response:**
```typescript
{
  id: string;
  course: Course;
  facilitator: Facilitator;
  className: string;
  capacity: number;
  enrolledCount: number;
  status: string;
  schedule: object[];
  semester: string;
  startDate: Date;
  endDate: Date;
  enrollments: Enrollment[];
  materials: LearningMaterial[];
  stats: {
    averageGrade: number;
    attendanceRate: number;
    passRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 11. Update Class
**Endpoint:** `PATCH /classes/:id`

**Request Body:**
```typescript
{
  className?: string;
  capacity?: number;
  schedule?: object[];
  facilitatorId?: string;  // Reassign facilitator
  // Cannot change course, semester, or dates
}
```

**Business Rules:**
- Cannot reduce capacity below current enrollment
- Schedule changes checked for facilitator conflicts
- Facilitator reassignment notifies all parties

---

### 12. Change Class Status
**Endpoint:** `PATCH /classes/:id/status`

**Request Body:**
```typescript
{
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  reason?: string;
}
```

**Business Rules:**
- ACTIVE: Class is ongoing, students can submit work
- COMPLETED: Class is finished, no more submissions
- CANCELLED: Class is cancelled, students notified
- Status changes logged for audit

---

### 13. Get Class Students
**Endpoint:** `GET /classes/:id/students`

**Query Parameters:**
```typescript
{
  status?: string;  // ACTIVE, COMPLETED, DROPPED
  includeGrades?: boolean;
  search?: string;
}
```

**Response:**
```typescript
{
  students: [
    {
      id: string;
      user: { fullName: string; email: string; };
      enrollmentDate: Date;
      status: string;
      currentGrade?: number;
    }
  ];
  total: number;
}
```

---

### 14. Get Class Schedule
**Endpoint:** `GET /classes/:id/schedule`

**Response:**
```typescript
{
  className: string;
  course: string;
  facilitator: string;
  schedule: [
    {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      room?: string;
    }
  ];
  semester: string;
  startDate: Date;
  endDate: Date;
}
```

---

### 15. Enroll Student in Class
**Endpoint:** `POST /classes/:id/enroll`

**Request Body:**
```typescript
{
  studentId: string;
}
```

**Business Rules:**
- Student must exist and be ACTIVE
- Class must have available capacity
- Student cannot enroll twice in same class
- Student cannot enroll if schedule conflict exists
- Check prerequisites if applicable

**Response:**
```typescript
{
  enrollment: {
    id: string;
    student: { fullName: string; };
    class: { className: string; };
    enrollmentDate: Date;
    status: 'ACTIVE';
  };
  message: string;
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Cannot enroll (capacity, conflict, etc.)
- `409 Conflict` - Already enrolled

---

### 16. Remove Student from Class
**Endpoint:** `DELETE /classes/:id/students/:studentId`

**Description:** Drop student from class

**Business Rules:**
- Can only drop ACTIVE enrollments
- Student progress/grades are preserved
- Drop reason can be recorded
- Notifications sent

**Status Codes:**
- `204 No Content` - Success
- `404 Not Found` - Enrollment not found

---

## Data Transfer Objects (DTOs)

### CreateCourseDto
```typescript
export class CreateCourseDto {
  @Matches(/^[A-Z]{2,4}\d{3}$/)
  code: string;

  @Length(3, 200)
  name: string;

  @IsOptional()
  description?: string;

  @Min(1)
  @Max(10)
  credits: number;

  @IsOptional()
  prerequisites?: string;

  @IsOptional()
  @IsUrl()
  syllabusUrl?: string;
}
```

### CreateClassDto
```typescript
export class CreateClassDto {
  @IsUUID()
  courseId: string;

  @IsUUID()
  facilitatorId: string;

  @Length(1, 100)
  className: string;

  @Min(1)
  @Max(500)
  capacity: number;

  @IsDateString()
  @IsNotPast()
  startDate: Date;

  @IsDateString()
  startDate: Date;

  @ValidSchedule()
  schedule: object[];

  @IsOptional()
  semester?: string;
}
```

---

## Service Methods

### CoursesService

```typescript
export class CoursesService {
  async createCourse(dto: CreateCourseDto): Promise<Course>
  async findAll(page: number, limit: number, filters: any): Promise<{ data: Course[]; total: number; }>
  async findById(id: string): Promise<Course>
  async updateCourse(id: string, dto: UpdateCourseDto): Promise<Course>
  async archiveCourse(id: string): Promise<Course>
  async getClasses(courseId: string, filters?: any): Promise<Class[]>
  async getMaterials(courseId: string, filters?: any): Promise<LearningMaterial[]>
  async validateCode(code: string): Promise<boolean>
  async validatePrerequisites(prerequisites: string[]): Promise<boolean>
}
```

### ClassesService

```typescript
export class ClassesService {
  async createClass(dto: CreateClassDto): Promise<Class>
  async findAll(page: number, limit: number, filters: any): Promise<{ data: Class[]; total: number; }>
  async findById(id: string): Promise<Class>
  async updateClass(id: string, dto: UpdateClassDto): Promise<Class>
  async updateStatus(id: string, status: string, reason?: string): Promise<Class>
  async getStudents(classId: string, filters?: any): Promise<Enrollment[]>
  async enrollStudent(classId: string, studentId: string): Promise<Enrollment>
  async removeStudent(classId: string, studentId: string): Promise<void>
  async getSchedule(classId: string): Promise<any>
  async checkCapacity(classId: string): Promise<boolean>
  async checkScheduleConflict(facilitatorId: string, schedule: object[]): Promise<boolean>
  async updateEnrolledCount(classId: string): Promise<void>
}
```

---

## Business Logic

### Schedule Conflict Detection
```
For each proposed class:
  For each schedule slot (day + time):
    For each existing class of same facilitator:
      For each existing slot:
        If day matches AND times overlap:
          CONFLICT FOUND
          Return error
```

### Enrollment Validation
```
Before enrolling student:
  1. Verify student is ACTIVE
  2. Check class has available capacity
  3. Check for schedule conflicts with student's other classes
  4. Check prerequisites if required
  5. Check student not already enrolled
  6. If all pass: Create enrollment record
```

### Class Status Lifecycle
```
UPCOMING -> ACTIVE (when startDate is reached)
  ↓
ACTIVE -> COMPLETED (when endDate is passed or manually marked)
  ↓
COMPLETED (final state)

UPCOMING/ACTIVE -> CANCELLED (at any time, notifies students)
```

---

## Validation Rules

### Course Code
- Format: 2-4 uppercase letters + 3 digits (e.g., CS101, MATH201)
- Must be unique in system
- Cannot be changed after creation

### Course Credits
- Must be 1-10
- Typically 1, 2, 3, or 4
- Used in GPA calculation

### Prerequisites
- Comma-separated list of course codes
- Must exist in system
- Circular prerequisites not allowed

### Class Capacity
- Minimum 1, maximum 500
- Cannot reduce below current enrollment
- Used for enrollment validation

### Schedule
- At least one session per week
- No overlapping times for same facilitator
- Times in 24-hour format (HH:MM)
- Valid day names

---

## Access Control

| Operation | Student | Facilitator | Manager | Admin |
|-----------|---------|-------------|---------|-------|
| View courses | ✅ | ✅ | ✅ | ✅ |
| Create course | ✗ | ✗ | ✗ | ✅ |
| Update course | ✗ | ✗ | ✗ | ✅ |
| Archive course | ✗ | ✗ | ✗ | ✅ |
| View classes | ✅ | ✅ | ✅ | ✅ |
| Create class | ✗ | ✗ | ✅ | ✅ |
| Update class | ✗ | ✅ | ✅ | ✅ |
| Enroll student | ✅ | ✗ | ✅ | ✅ |
| Change status | ✗ | ✗ | ✅ | ✅ |

---

## Summary

The Course & Class Management feature provides:
- ✅ Comprehensive curriculum management
- ✅ Flexible class scheduling
- ✅ Capacity and conflict management
- ✅ Enrollment lifecycle
- ✅ Prerequisite validation
- ✅ Integration with academic operations
