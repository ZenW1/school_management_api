# 1. Student Management Feature

## Overview
The Student Management feature handles comprehensive student data including registration, profile management, enrollment tracking, and academic records. This is a core module for the SMS system.

---

## Feature Scope

### Core Responsibilities
- Student registration and onboarding
- Personal & contact information management
- Enrollment tracking (courses/classes)
- Academic performance monitoring (GPA, grades)
- Attendance history
- Document management (ID, certificates)
- Student status lifecycle management

### Key Entities

#### Student Entity
```typescript
@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column()
  enrollmentDate: Date;

  @Column({ nullable: true })
  parentName: string;

  @Column({ nullable: true })
  parentPhone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  gpa: number;

  @Column({ 
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED'],
    default: 'ACTIVE'
  })
  status: string;

  @OneToMany(() => Enrollment, enrollment => enrollment.student)
  enrollments: Enrollment[];

  @OneToMany(() => Grade, grade => grade.student)
  grades: Grade[];

  @OneToMany(() => Attendance, attendance => attendance.student)
  attendances: Attendance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## API Endpoints

### 1. List All Students
**Endpoint:** `GET /students`

**Description:** Retrieve paginated list of all students (admin/manager only)

**Query Parameters:**
```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  status?: string;      // Filter: ACTIVE, INACTIVE, GRADUATED, SUSPENDED
  search?: string;      // Search by name or email
  sortBy?: string;      // Default: createdAt
  sortOrder?: 'ASC' | 'DESC';
}
```

**Response:**
```typescript
{
  data: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**Status Codes:** 
- `200 OK` - Success
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Insufficient permissions

---

### 2. Create Student
**Endpoint:** `POST /students`

**Description:** Register a new student (admin/manager only)

**Request Body:**
```typescript
{
  email: string;              // Required, unique, valid email
  password: string;           // Required, min 8 chars
  fullName: string;           // Required
  phone: string;              // Required
  enrollmentDate: Date;       // Required, cannot be future date
  parentName?: string;
  parentPhone?: string;
  address?: string;
  dateOfBirth?: Date;         // Must be < 18 years ago for validation
}
```

**Validation Rules:**
- Email must be unique in system
- Password must be 8+ characters, contain uppercase, lowercase, number
- Full name must be 2-100 characters
- Phone must be valid format (10-15 digits)
- Enrollment date cannot be in the future
- Date of birth must be reasonable (1900 onwards)

**Response:**
```typescript
{
  id: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
  };
  enrollmentDate: Date;
  status: 'ACTIVE';
  gpa: 0;
  createdAt: Date;
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Validation error
- `409 Conflict` - Email already exists

---

### 3. Get Student Details
**Endpoint:** `GET /students/:id`

**Description:** Retrieve complete student profile (student can view own, admin/manager can view all)

**Response:**
```typescript
{
  id: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
  };
  enrollmentDate: Date;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  dateOfBirth?: Date;
  status: string;
  gpa: number;
  enrollments: Enrollment[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Student not found
- `403 Forbidden` - Cannot view other student's profile

---

### 4. Update Student Profile
**Endpoint:** `PATCH /students/:id`

**Description:** Update student information (student can update own, admin/manager can update all)

**Request Body:**
```typescript
{
  fullName?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  dateOfBirth?: Date;
  // Note: email, password changes handled separately
}
```

**Validation Rules:**
- Same validation rules as creation apply
- Cannot modify enrollment date or status directly

**Response:** Updated Student object

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Validation error
- `404 Not Found` - Student not found
- `403 Forbidden` - Insufficient permissions

---

### 5. Deactivate/Suspend Student
**Endpoint:** `PATCH /students/:id/status`

**Description:** Change student status (admin/manager only)

**Request Body:**
```typescript
{
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED';
  reason?: string;  // Optional reason for status change
}
```

**Business Rules:**
- Only admin/manager can change status
- Suspended students cannot access learning materials or submit assignments
- Graduated students become read-only
- Status changes are logged for audit

**Response:**
```typescript
{
  id: string;
  status: string;
  updatedAt: Date;
}
```

---

### 6. Get Student Enrolled Courses
**Endpoint:** `GET /students/:id/courses`

**Description:** List all courses/classes student is enrolled in

**Query Parameters:**
```typescript
{
  status?: string;  // Filter by enrollment status: ACTIVE, COMPLETED, DROPPED
  sortBy?: string;  // Default: enrollmentDate
}
```

**Response:**
```typescript
{
  enrollments: [
    {
      id: string;
      class: {
        id: string;
        className: string;
        course: {
          id: string;
          name: string;
          code: string;
        };
        facilitator: {
          id: string;
          user: { fullName: string; };
        };
        startDate: Date;
        endDate: Date;
      };
      enrollmentDate: Date;
      status: string;
    }
  ];
}
```

---

### 7. Get Student Grades
**Endpoint:** `GET /students/:id/grades`

**Description:** Retrieve all grades and GPA

**Query Parameters:**
```typescript
{
  classId?: string;      // Filter by class
  semesterId?: string;   // Filter by semester
  includeBreakdown?: boolean;  // Include per-assignment breakdown
}
```

**Response:**
```typescript
{
  currentGpa: number;
  grades: [
    {
      id: string;
      class: {
        id: string;
        className: string;
        course: { name: string; };
      };
      assignment?: {
        id: string;
        title: string;
      };
      score: number;
      maxScore: number;
      weight: number;
      gradedAt: Date;
      feedback?: string;
    }
  ];
  summary: {
    totalAssignments: number;
    averageScore: number;
    passingClasses: number;
    failingClasses: number;
  };
}
```

---

### 8. Get Student Attendance
**Endpoint:** `GET /students/:id/attendance`

**Description:** Get student's attendance record

**Query Parameters:**
```typescript
{
  classId?: string;
  from?: Date;
  to?: Date;
  includeStats?: boolean;
}
```

**Response:**
```typescript
{
  attendanceRecords: [
    {
      id: string;
      class: {
        id: string;
        className: string;
      };
      date: Date;
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
      remarks?: string;
    }
  ];
  statistics: {
    totalClasses: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    attendancePercentage: number;
  };
}
```

---

### 9. Delete Student (Soft Delete)
**Endpoint:** `DELETE /students/:id`

**Description:** Deactivate student account (admin only)

**Business Rules:**
- Soft delete (marks as INACTIVE, doesn't remove data)
- All enrollments are cancelled
- Student cannot login
- All data is preserved for audit trail

**Status Codes:**
- `204 No Content` - Success
- `404 Not Found` - Student not found
- `403 Forbidden` - Insufficient permissions

---

## Data Transfer Objects (DTOs)

### CreateStudentDto
```typescript
export class CreateStudentDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password: string;

  @Length(2, 100)
  fullName: string;

  @Matches(/^\+?[1-9]\d{1,14}$/)
  phone: string;

  @IsDateString()
  @IsNotFuture()
  enrollmentDate: Date;

  @IsOptional()
  @Length(2, 100)
  parentName?: string;

  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  parentPhone?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;
}
```

### UpdateStudentDto
```typescript
export class UpdateStudentDto {
  @IsOptional()
  @Length(2, 100)
  fullName?: string;

  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  phone?: string;

  @IsOptional()
  @Length(2, 100)
  parentName?: string;

  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  parentPhone?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;
}
```

### StudentResponseDto
```typescript
export class StudentResponseDto {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  enrollmentDate: Date;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  dateOfBirth?: Date;
  status: string;
  gpa: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Service Methods

### StudentsService

```typescript
export class StudentsService {
  constructor(
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private usersService: UsersService,
    private enrollmentService: EnrollmentService,
  ) {}

  // Create new student and associated user
  async createStudent(dto: CreateStudentDto): Promise<Student>

  // Get all students with pagination and filtering
  async findAll(
    page: number,
    limit: number,
    filters: any,
  ): Promise<{ data: Student[]; total: number; }>

  // Get student by ID with relationships
  async findById(id: string): Promise<Student>

  // Update student profile
  async updateStudent(id: string, dto: UpdateStudentDto): Promise<Student>

  // Change student status
  async updateStatus(id: string, status: string): Promise<Student>

  // Get student's enrolled courses
  async getEnrolledCourses(
    studentId: string,
    filters?: any,
  ): Promise<Enrollment[]>

  // Get student's grades
  async getGrades(studentId: string, filters?: any): Promise<any>

  // Get student's attendance
  async getAttendance(studentId: string, filters?: any): Promise<any>

  // Calculate/update student GPA
  async updateGPA(studentId: string): Promise<number>

  // Soft delete student
  async deleteStudent(id: string): Promise<void>

  // Search students by name/email
  async searchStudents(query: string, limit: number): Promise<Student[]>
}
```

---

## Business Logic & Workflows

### Student Registration Workflow
1. Admin/Manager submits student registration form
2. System validates all input data
3. User account is created with STUDENT role
4. Student record is linked to User
5. Initial GPA is set to 0
6. Student status is set to ACTIVE
7. Confirmation email is sent to student
8. Student can login with provided credentials

### Enrollment Workflow
1. Student (or admin) selects course/class
2. System checks class capacity
3. System verifies no schedule conflicts
4. Enrollment record is created
5. Student is added to class roster
6. Facilitator is notified
7. Learning materials become accessible

### Status Change Workflow
1. Admin initiates status change
2. Reason is recorded for audit
3. System updates student status
4. If SUSPENDED: student access is revoked
5. If GRADUATED: enrollments are marked completed
6. Audit log entry is created
7. Notification is sent to student

### GPA Calculation Logic
```
GPA = Sum(grade × weight) / Sum(weights) for all classes
- Each class has a weight (typically credits)
- Each class grade is the weighted average of assignments
- GPA is recalculated whenever a grade is submitted
- GPA is rounded to 2 decimal places
```

---

## Validation Rules

### Email
- Must be unique across the system
- Must be valid email format
- Case-insensitive for uniqueness checks

### Phone Number
- Must be 10-15 digits (with optional + prefix)
- International format supported

### Full Name
- Required, 2-100 characters
- Alphanumeric and spaces allowed
- Cannot be empty or contain only whitespace

### Date of Birth
- Must be in the past
- Student must be at least 5 years old
- Cannot be before 1900

### Enrollment Date
- Cannot be in the future
- Typically set to current date for new students

### Status Transitions
- ACTIVE → INACTIVE, GRADUATED, SUSPENDED (allowed)
- INACTIVE → ACTIVE (allowed, with reason)
- GRADUATED → (no changes, final state)
- SUSPENDED → ACTIVE (allowed, with reason)

---

## Access Control

### Who Can Access What

| Operation | Student | Facilitator | Manager | Admin |
|-----------|---------|-------------|---------|-------|
| View own profile | ✅ | ✗ | ✗ | ✗ |
| View all students | ✗ | ✗ | ✅ | ✅ |
| Create student | ✗ | ✗ | ✅ | ✅ |
| Update own profile | ✅ | ✗ | ✗ | ✗ |
| Update any student | ✗ | ✗ | ✅ | ✅ |
| Change status | ✗ | ✗ | ✗ | ✅ |
| Delete student | ✗ | ✗ | ✗ | ✅ |
| View grades | ✅ | ✅ | ✅ | ✅ |
| View attendance | ✅ | ✅ | ✅ | ✅ |

---

## Integration Points

### With Other Modules
- **Users Module:** Student profile relies on User entity for auth data
- **Enrollment Module:** Students enroll in classes (one-to-many relationship)
- **Grades Module:** Student grades are tracked and aggregated
- **Attendance Module:** Student attendance is recorded per class
- **Notifications Module:** Student receives alerts about grades, attendance

### Events Triggered
- `student.created` → Send welcome email
- `student.status-changed` → Notify student and admins
- `student.graduated` → Archive student data
- `student.suspended` → Revoke access to learning materials

---

## Error Handling

### Common Errors

| Error Code | Status | Scenario |
|-----------|--------|----------|
| STUDENT_NOT_FOUND | 404 | Student ID doesn't exist |
| EMAIL_ALREADY_EXISTS | 409 | Duplicate email on create/update |
| INVALID_EMAIL | 400 | Email validation failed |
| WEAK_PASSWORD | 400 | Password doesn't meet requirements |
| INVALID_PHONE | 400 | Phone format invalid |
| FUTURE_ENROLLMENT_DATE | 400 | Enrollment date is in future |
| INVALID_STATUS_TRANSITION | 400 | Status change not allowed |
| INSUFFICIENT_PERMISSIONS | 403 | User lacks permission |
| STUDENT_SUSPENDED | 403 | Suspended student cannot perform action |

---

## Performance Considerations

### Indexing Strategy
```sql
CREATE INDEX idx_student_user_id ON students(user_id);
CREATE INDEX idx_student_status ON students(status);
CREATE INDEX idx_student_enrollment_date ON students(enrollment_date);
CREATE INDEX idx_user_email ON users(email) WHERE role = 'STUDENT';
```

### Caching
- Cache student profile for 5 minutes
- Cache student GPA for 1 hour
- Invalidate cache on any update

### Query Optimization
- Use `eager: true` for User relationship in Student entity
- Use `leftJoinAndSelect` for optional relationships
- Implement pagination for large result sets
- Use database-level sorting instead of application-level

---

## Testing

### Unit Tests
- Validate email format and uniqueness
- Validate password strength
- Test GPA calculation
- Test status transitions
- Test filtering and search

### Integration Tests
- Create student end-to-end
- Update student and verify persistence
- List students with pagination
- Verify access control
- Test cascade behaviors (delete user → delete student)

### Mock Data
```typescript
const mockStudent = {
  id: 'uuid',
  user: {
    id: 'uuid',
    email: 'student@school.edu',
    fullName: 'John Doe',
    phone: '+1234567890',
  },
  enrollmentDate: new Date('2024-01-15'),
  parentName: 'Jane Doe',
  parentPhone: '+1234567891',
  address: '123 Main St, City, State 12345',
  dateOfBirth: new Date('2005-06-15'),
  status: 'ACTIVE',
  gpa: 3.75,
};
```

---

## Summary

The Student Management feature is foundational to the SMS. It provides:
- ✅ Complete student lifecycle management
- ✅ Profile and enrollment tracking
- ✅ Academic performance monitoring
- ✅ Role-based access control
- ✅ Integration with other modules
- ✅ Comprehensive audit trails
