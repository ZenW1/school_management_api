# 5. Assessment & Grading Feature

## Overview
The Assessment & Grading feature manages assignments, student submissions, grade entry, GPA calculation, and performance reporting. This is critical for academic tracking and student progress monitoring.

---

## Feature Scope

### Core Responsibilities
- Assignment creation and management
- Student submission handling
- Grade entry and feedback
- Automatic GPA calculation
- Performance analytics
- Grade distribution reports
- Progress tracking
- Rubric-based grading (optional)

### Key Entities

#### Assignment Entity
```typescript
@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Class, { eager: true })
  @JoinColumn()
  class: Class;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  maxScore: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1 })
  weight: number;  // Importance factor (0.5 to 2.0)

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  submissionDeadlineExtension?: Date;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'GRADING'],
    default: 'DRAFT'
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;  // Markdown support

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => Submission, submission => submission.assignment)
  submissions: Submission[];

  @OneToMany(() => Grade, grade => grade.assignment)
  grades: Grade[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Submission Entity
```typescript
@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Assignment, { eager: true })
  @JoinColumn()
  assignment: Assignment;

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn()
  student: Student;

  @Column()
  submissionUrl: string;  // S3 URL or file path

  @Column({ type: 'text', nullable: true })
  submittedContent: string;  // If text-based

  @Column({ nullable: true })
  fileName?: string;

  @Column({ type: 'int', nullable: true })
  fileSizeBytes?: number;

  @Column({
    type: 'enum',
    enum: ['SUBMITTED', 'LATE', 'GRADED', 'PENDING', 'NOT_SUBMITTED'],
    default: 'PENDING'
  })
  status: string;

  @CreateDateColumn()
  submittedAt: Date;

  @Column({ type: 'boolean', default: false })
  isLate: boolean;

  @Column({ nullable: true })
  latePenalty?: number;  // Percentage deduction

  @OneToOne(() => Grade, { nullable: true })
  @JoinColumn()
  grade?: Grade;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Grade Entity
```typescript
@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn()
  student: Student;

  @ManyToOne(() => Class, { nullable: true })
  @JoinColumn()
  class?: Class;

  @ManyToOne(() => Assignment, { nullable: true })
  @JoinColumn()
  assignment?: Assignment;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  maxScore: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1 })
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weightedScore: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;  // Markdown support

  @ManyToOne(() => User)
  @JoinColumn({ name: 'graded_by' })
  gradedBy: User;

  @CreateDateColumn()
  gradedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'json', nullable: true })
  rubricScores?: {  // If using rubric
    criterion1?: number;
    criterion2?: number;
    // ...
  };
}
```

---

## API Endpoints

### ASSIGNMENT ENDPOINTS

### 1. Create Assignment
**Endpoint:** `POST /assignments`

**Request Body:**
```typescript
{
  classId: string;
  title: string;              // 1-200 chars
  description: string;        // Markdown allowed
  maxScore: number;           // 1-1000
  weight?: number;            // Default: 1.0, Range: 0.5-2.0
  dueDate: Date;
  instructions?: string;      // Markdown
}
```

**Validation Rules:**
- Title and description required
- Due date cannot be in past
- Max score must be positive
- Class must exist and be ACTIVE
- Only facilitator of class or admin can create

**Response:**
```typescript
{
  id: string;
  class: { id: string; name: string; };
  title: string;
  maxScore: number;
  weight: number;
  dueDate: Date;
  status: 'DRAFT';
  createdBy: { fullName: string; };
  createdAt: Date;
}
```

---

### 2. List Assignments
**Endpoint:** `GET /assignments`

**Query Parameters:**
```typescript
{
  classId?: string;
  status?: string;            // DRAFT, PUBLISHED, CLOSED, GRADING
  from?: Date;
  to?: Date;
  sortBy?: string;            // dueDate, createdAt
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  data: Assignment[];
  total: number;
  stats: {
    draftCount: number;
    publishedCount: number;
    closedCount: number;
  };
}
```

---

### 3. Get Assignment Details
**Endpoint:** `GET /assignments/:id`

**Response:**
```typescript
{
  id: string;
  class: Class;
  title: string;
  description: string;
  maxScore: number;
  weight: number;
  dueDate: Date;
  status: string;
  instructions?: string;
  createdBy: User;
  submissions: Submission[];
  stats: {
    totalSubmissions: number;
    submittedCount: number;
    lateCount: number;
    gradedCount: number;
    averageScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4. Update Assignment
**Endpoint:** `PATCH /assignments/:id`

**Request Body:**
```typescript
{
  title?: string;
  description?: string;
  maxScore?: number;
  weight?: number;
  dueDate?: Date;
  instructions?: string;
}
```

**Business Rules:**
- Only DRAFT status can be updated
- Cannot change after PUBLISHED
- Creator or admin only

---

### 5. Publish Assignment
**Endpoint:** `PATCH /assignments/:id/publish`

**Business Rules:**
- Assignment must be in DRAFT status
- Makes assignment visible to students
- Cannot unpublish once published
- Sends notification to enrolled students

---

### 6. Close Assignment
**Endpoint:** `PATCH /assignments/:id/close`

**Business Rules:**
- No more submissions accepted
- Must have at least reviewed submissions
- Status changes to CLOSED or GRADING

---

### 7. Delete Assignment
**Endpoint:** `DELETE /assignments/:id`

**Business Rules:**
- Only DRAFT assignments can be deleted
- If published, only soft delete is allowed

---

### SUBMISSION ENDPOINTS

### 8. Submit Assignment
**Endpoint:** `POST /assignments/:id/submit`

**Request:** Multipart form-data or JSON

**For File Submission:**
```typescript
{
  file: File;  // Upload file
}
```

**For Text Submission:**
```typescript
{
  submittedContent: string;  // Text content
}
```

**Business Rules:**
- Student must be enrolled in class
- Assignment must be PUBLISHED
- No duplicate submission (unless resubmission allowed)
- Check if late (after dueDate)
- Store submission with timestamp
- Apply late penalty if applicable

**Response:**
```typescript
{
  id: string;
  assignmentId: string;
  studentId: string;
  status: 'SUBMITTED' | 'LATE';
  submittedAt: Date;
  isLate: boolean;
  latePenalty?: number;
  message: string;
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Invalid file or late submission not allowed
- `409 Conflict` - Already submitted

---

### 9. List Submissions
**Endpoint:** `GET /assignments/:assignmentId/submissions`

**Query Parameters:**
```typescript
{
  status?: string;            // SUBMITTED, LATE, GRADED, PENDING
  graded?: boolean;           // Filter by grading status
  sortBy?: string;            // submittedAt, score
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  submissions: Submission[];
  stats: {
    total: number;
    submitted: number;
    late: number;
    graded: number;
    notSubmitted: number;
  };
}
```

---

### 10. Get Submission Details
**Endpoint:** `GET /submissions/:id`

**Response:**
```typescript
{
  id: string;
  assignment: Assignment;
  student: Student;
  submittedContent?: string;
  submissionUrl?: string;
  status: string;
  submittedAt: Date;
  isLate: boolean;
  latePenalty?: number;
  grade?: {
    score: number;
    maxScore: number;
    feedback: string;
    gradedAt: Date;
  };
  updatedAt: Date;
}
```

---

### GRADING ENDPOINTS

### 11. Create Grade
**Endpoint:** `POST /grades`

**Request Body:**
```typescript
{
  studentId: string;
  assignmentId?: string;
  classId?: string;
  score: number;              // 0 to maxScore
  weight?: number;
  feedback?: string;          // Markdown support
  rubricScores?: object;      // If using rubric
}
```

**Validation Rules:**
- Score must be 0 to maxScore
- Both assignment and class, or just class
- Facilitator of class or admin only
- Automatically calculates weightedScore

**Response:**
```typescript
{
  id: string;
  student: { fullName: string; email: string; };
  assignment?: { title: string; };
  class?: { name: string; };
  score: number;
  maxScore: number;
  weight: number;
  weightedScore: number;
  feedback?: string;
  gradedAt: Date;
}
```

---

### 12. Update Grade
**Endpoint:** `PATCH /grades/:id`

**Request Body:**
```typescript
{
  score?: number;
  feedback?: string;
  rubricScores?: object;
}
```

**Response:** Updated grade object

---

### 13. Get Student Grades
**Endpoint:** `GET /students/:studentId/grades`

**Query Parameters:**
```typescript
{
  classId?: string;
  from?: Date;
  to?: Date;
  detailed?: boolean;  // Include per-assignment breakdown
}
```

**Response:**
```typescript
{
  currentGpa: number;
  grades: [
    {
      id: string;
      class: { name: string; };
      assignment: { title: string; };
      score: number;
      maxScore: number;
      weight: number;
      weightedScore: number;
      feedback?: string;
      gradedAt: Date;
    }
  ];
  summary: {
    totalAssignments: number;
    gradedAssignments: number;
    averageScore: number;
    averagePercentage: number;
  };
}
```

---

### 14. Get Class Grades
**Endpoint:** `GET /classes/:classId/grades`

**Query Parameters:**
```typescript
{
  format?: 'DETAILED' | 'SUMMARY';
  sortBy?: string;
}
```

**Response:**
```typescript
{
  class: { name: string; };
  gradesheet: [
    {
      student: { id: string; fullName: string; email: string; };
      grades: Grade[];
      classGrade: number;
      classGradePercentage: number;
      letterGrade: string;  // A, B, C, D, F
    }
  ];
  stats: {
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    medianScore: number;
  };
}
```

---

### 15. Get GPA
**Endpoint:** `GET /students/:studentId/gpa`

**Response:**
```typescript
{
  studentId: string;
  currentGpa: number;
  scale: 4.0;
  calculatedAt: Date;
  byClass: [
    {
      class: { name: string; };
      classGpa: number;
      credits: number;
    }
  ];
  details: {
    totalCredits: number;
    classesCompleted: number;
    classesInProgress: number;
  };
}
```

---

### 16. Get Grade Distribution Report
**Endpoint:** `GET /classes/:classId/grade-distribution`

**Response:**
```typescript
{
  class: { name: string; };
  distribution: {
    A: number;      // Count
    B: number;
    C: number;
    D: number;
    F: number;
  };
  percentages: {
    A: number;      // Percentage
    B: number;
    C: number;
    D: number;
    F: number;
  };
  stats: {
    meanScore: number;
    medianScore: number;
    standardDeviation: number;
  };
}
```

---

## Data Transfer Objects (DTOs)

### CreateAssignmentDto
```typescript
export class CreateAssignmentDto {
  @IsUUID()
  classId: string;

  @Length(1, 200)
  title: string;

  @Length(10, 5000)
  description: string;

  @Min(1)
  @Max(1000)
  maxScore: number;

  @IsOptional()
  @Min(0.5)
  @Max(2.0)
  weight?: number;

  @IsDateString()
  @IsNotPast()
  dueDate: Date;

  @IsOptional()
  instructions?: string;
}
```

### CreateGradeDto
```typescript
export class CreateGradeDto {
  @IsUUID()
  studentId: string;

  @IsOptional()
  @IsUUID()
  assignmentId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @Min(0)
  score: number;

  @IsOptional()
  @Min(0.5)
  @Max(2.0)
  weight?: number;

  @IsOptional()
  feedback?: string;

  @IsOptional()
  @Type(() => Object)
  rubricScores?: object;
}
```

---

## Service Methods

### AssignmentsService
```typescript
export class AssignmentsService {
  async createAssignment(dto: CreateAssignmentDto): Promise<Assignment>
  async findAll(page: number, limit: number, filters: any): Promise<{ data: Assignment[]; total: number; }>
  async findById(id: string): Promise<Assignment>
  async updateAssignment(id: string, dto: UpdateAssignmentDto): Promise<Assignment>
  async publishAssignment(id: string): Promise<Assignment>
  async closeAssignment(id: string): Promise<Assignment>
  async deleteAssignment(id: string): Promise<void>
  async getSubmissions(assignmentId: string, filters?: any): Promise<Submission[]>
}
```

### SubmissionsService
```typescript
export class SubmissionsService {
  async submitAssignment(assignmentId: string, studentId: string, file?: Express.Multer.File, content?: string): Promise<Submission>
  async getSubmission(id: string): Promise<Submission>
  async getStudentSubmissions(studentId: string, assignmentId: string): Promise<Submission[]>
  async checkLatePenalty(submittedAt: Date, dueDate: Date): Promise<number>
}
```

### GradesService
```typescript
export class GradesService {
  async createGrade(dto: CreateGradeDto, gradedBy: User): Promise<Grade>
  async updateGrade(id: string, dto: UpdateGradeDto): Promise<Grade>
  async getStudentGrades(studentId: string, classId?: string): Promise<Grade[]>
  async getClassGrades(classId: string): Promise<Grade[]>
  async calculateGPA(studentId: string): Promise<number>
  async calculateClassGrade(studentId: string, classId: string): Promise<number>
  async getGradeDistribution(classId: string): Promise<any>
  async recalculateAllGPAs(): Promise<void>
}
```

---

## Business Logic

### GPA Calculation
```
For a student across all classes:
  1. For each class:
     a. For each assignment in class:
        score_weighted = (assignment_score / assignment_max) × assignment_weight
     b. class_grade = sum(score_weighted) / sum(weights)
     c. class_gpa = class_grade / 100 × 4.0  (on 4.0 scale)
  
  2. overall_gpa = sum(class_gpa × class_credits) / sum(class_credits)
  
  3. Round to 2 decimal places
```

### Letter Grade Conversion
```
GPA / Score   → Letter Grade
3.85 - 4.0    → A     (90-100%)
3.5 - 3.84    → A-    (87-89%)
3.15 - 3.49   → B+    (83-86%)
2.85 - 3.14   → B     (80-82%)
2.5 - 2.84    → B-    (77-79%)
2.15 - 2.49   → C+    (73-76%)
1.85 - 2.14   → C     (70-72%)
1.5 - 1.84    → C-    (67-69%)
1.15 - 1.49   → D+    (63-66%)
0.85 - 1.14   → D     (60-62%)
0 - 0.84      → F     (<60%)
```

### Late Submission Penalty
```
If submitted after dueDate:
  latePenalty = 5% per day late (configurable)
  Max penalty = 50%
  
  final_score = submission_score × (1 - latePenalty)
```

### Submission Status Workflow
```
PENDING → (student submits file)
  ↓
SUBMITTED or LATE
  ↓
(facilitator grades)
  ↓
GRADED
```

---

## Validation Rules

### Score Validation
- Must be between 0 and maxScore
- Can be decimal (e.g., 7.5/10)
- Required for grade creation

### Weight Validation
- Range: 0.5 to 2.0
- Default: 1.0
- Used in GPA calculation

### Due Date
- Cannot be in the past when creating assignment
- Must be after class start date
- Must be before class end date

### Late Penalty
- Default: 5% per day
- Max: 50%
- Configurable per school

---

## Access Control

| Operation | Student | Facilitator | Manager | Admin |
|-----------|---------|-------------|---------|-------|
| Create assignment | ✗ | ✅ | ✗ | ✅ |
| View assignment | ✅ | ✅ | ✅ | ✅ |
| Update assignment | Facilitator | ✅ | ✗ | ✅ |
| Submit assignment | ✅ | ✗ | ✗ | ✗ |
| View own submission | ✅ | ✅ | ✅ | ✅ |
| Grade submission | Facilitator | ✅ | ✗ | ✅ |
| View class grades | Facilitator | ✅ | ✅ | ✅ |
| View own grades | ✅ | ✗ | ✗ | ✗ |
| Generate reports | ✗ | ✅ | ✅ | ✅ |

---

## Integration Points

### With Other Modules
- **Students Module:** Grades linked to students
- **Classes Module:** Assignments per class
- **Attendance Module:** May affect grading
- **Notifications Module:** Grade notifications

### Events Triggered
- `assignment.published` → Notify students
- `assignment.closed` → Notify of cutoff
- `grade.created` → Notify student
- `grade.updated` → Notify if score changed significantly
- `gpa.updated` → Trigger if threshold crossed

---

## Error Handling

| Error Code | Status | Scenario |
|-----------|--------|----------|
| ASSIGNMENT_NOT_FOUND | 404 | Assignment ID doesn't exist |
| SUBMISSION_NOT_FOUND | 404 | Submission not found |
| INVALID_SCORE | 400 | Score > maxScore |
| LATE_SUBMISSION_CLOSED | 400 | Late submissions not allowed |
| ALREADY_SUBMITTED | 409 | Student already submitted |
| INVALID_STATUS_TRANSITION | 400 | Cannot publish non-draft |
| INSUFFICIENT_PERMISSIONS | 403 | Not facilitator of class |

---

## Performance Considerations

### Indexing
```sql
CREATE INDEX idx_assignment_class_id ON assignments(class_id);
CREATE INDEX idx_assignment_status ON assignments(status);
CREATE INDEX idx_submission_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submission_student_id ON submissions(student_id);
CREATE INDEX idx_grade_student_id ON grades(student_id);
CREATE INDEX idx_grade_class_id ON grades(class_id);
CREATE INDEX idx_grade_assignment_id ON grades(assignment_id);
```

### Caching
- Cache GPA for 1 hour
- Cache class grade distribution for 30 minutes
- Invalidate on grade update

### Batch Operations
- Batch grade import from CSV
- Batch grade calculation (scheduled job)
- Efficient GPA recalculation

---

## Summary

The Assessment & Grading feature provides:
- ✅ Complete assignment lifecycle management
- ✅ Flexible submission handling
- ✅ Automatic GPA calculation
- ✅ Comprehensive grading system
- ✅ Performance analytics
- ✅ Late submission penalties
- ✅ Grade distribution analysis
