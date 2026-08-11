# 2. Facilitator (Teacher) Management Feature

## Overview
The Facilitator Management feature handles teacher/instructor data including registration, credentials, class assignments, performance tracking, and professional information. Facilitators are the core educators in the system.

---

## Feature Scope

### Core Responsibilities
- Facilitator registration and onboarding
- Credential and qualification management
- Class assignment and scheduling
- Student performance monitoring
- Attendance marking capability
- Availability management
- Professional development tracking
- Performance evaluation

### Key Entities

#### Facilitator Entity
```typescript
@Entity('facilitators')
export class Facilitator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  qualification: string;

  @Column({ nullable: true })
  hireDate: Date;

  @Column({ nullable: true })
  department: string;

  @Column({ 
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'RETIRED'],
    default: 'ACTIVE'
  })
  status: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  performanceRating: number;

  @Column({ type: 'int', default: 0 })
  totalClassesAssigned: number;

  @Column({ type: 'int', default: 0 })
  totalStudentsTaught: number;

  @OneToMany(() => Class, classEntity => classEntity.facilitator)
  classes: Class[];

  @OneToMany(() => Grade, grade => grade.gradedBy)
  gradesGiven: Grade[];

  @Column({ type: 'json', nullable: true })
  availability: {
    mondayHours?: { start: string; end: string };
    tuesdayHours?: { start: string; end: string };
    // ... other days
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## API Endpoints

### 1. List All Facilitators
**Endpoint:** `GET /facilitators`

**Description:** Retrieve paginated list of all facilitators

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  status?: string;           // ACTIVE, INACTIVE, ON_LEAVE, RETIRED
  department?: string;
  specialization?: string;
  search?: string;           // Search by name or email
  sortBy?: string;           // Default: createdAt
  sortOrder?: 'ASC' | 'DESC';
}
```

**Response:**
```typescript
{
  data: Facilitator[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

### 2. Create Facilitator
**Endpoint:** `POST /facilitators`

**Description:** Register a new facilitator (admin/manager only)

**Request Body:**
```typescript
{
  email: string;
  password: string;
  fullName: string;
  phone: string;
  specialization: string;    // e.g., "Mathematics", "English"
  qualification: string;     // e.g., "M.Sc Computer Science"
  hireDate: Date;
  department?: string;       // e.g., "Science", "Languages"
}
```

**Validation Rules:**
- Email must be unique
- Password must be 8+ chars with uppercase, lowercase, number
- Full name 2-100 characters
- Phone must be valid
- Specialization required and non-empty
- Hire date cannot be in future

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
  specialization: string;
  qualification: string;
  hireDate: Date;
  department?: string;
  status: 'ACTIVE';
  performanceRating: 0;
  totalClassesAssigned: 0;
  totalStudentsTaught: 0;
  createdAt: Date;
}
```

---

### 3. Get Facilitator Details
**Endpoint:** `GET /facilitators/:id`

**Description:** Retrieve complete facilitator profile

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
  specialization: string;
  qualification: string;
  hireDate: Date;
  department?: string;
  status: string;
  performanceRating: number;
  totalClassesAssigned: number;
  totalStudentsTaught: number;
  availability?: object;
  classes: Class[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4. Update Facilitator Profile
**Endpoint:** `PATCH /facilitators/:id`

**Description:** Update facilitator information (facilitator can update own, admin can update all)

**Request Body:**
```typescript
{
  fullName?: string;
  phone?: string;
  specialization?: string;
  qualification?: string;
  department?: string;
  availability?: object;
}
```

**Response:** Updated Facilitator object

---

### 5. Change Facilitator Status
**Endpoint:** `PATCH /facilitators/:id/status`

**Description:** Change facilitator employment status

**Request Body:**
```typescript
{
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'RETIRED';
  effectiveDate?: Date;
  reason?: string;
}
```

**Business Rules:**
- ON_LEAVE: Facilitator is temporarily unavailable
- INACTIVE: Facilitator is no longer employed
- RETIRED: Final status, cannot revert
- Admin can only change status
- Status changes are logged for audit

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid status transition
- `403 Forbidden` - Insufficient permissions

---

### 6. Get Facilitator's Classes
**Endpoint:** `GET /facilitators/:id/classes`

**Description:** List all classes assigned to facilitator

**Query Parameters:**
```typescript
{
  semester?: string;
  status?: string;           // ACTIVE, COMPLETED, UPCOMING
  includeStudents?: boolean;
}
```

**Response:**
```typescript
{
  classes: [
    {
      id: string;
      className: string;
      course: {
        id: string;
        name: string;
        code: string;
      };
      schedule: object;
      startDate: Date;
      endDate: Date;
      status: string;
      enrolledStudents: number;
      capacity: number;
    }
  ];
  summary: {
    totalClasses: number;
    activeClasses: number;
    completedClasses: number;
    totalStudents: number;
  };
}
```

---

### 7. Get Facilitator's Students
**Endpoint:** `GET /facilitators/:id/students`

**Description:** List all students taught by facilitator

**Query Parameters:**
```typescript
{
  classId?: string;
  includeGrades?: boolean;
  semester?: string;
}
```

**Response:**
```typescript
{
  students: [
    {
      id: string;
      user: {
        fullName: string;
        email: string;
      };
      class: {
        id: string;
        className: string;
      };
      currentGrade?: number;
      enrollmentDate: Date;
    }
  ];
  total: number;
}
```

---

### 8. Get Facilitator Performance
**Endpoint:** `GET /facilitators/:id/performance`

**Description:** Get facilitator performance metrics

**Response:**
```typescript
{
  id: string;
  fullName: string;
  performanceRating: number;
  metrics: {
    averageStudentGrade: number;
    classCompletionRate: number;
    studentPassRate: number;
    attendanceConsistency: number;
  };
  studentFeedback: {
    averageRating: number;
    totalReviews: number;
    recentReviews: string[];
  };
  teachingExperience: {
    yearsExperience: number;
    totalClassesTaught: number;
    totalStudentsImpacted: number;
  };
  evaluations: [
    {
      date: Date;
      rating: number;
      evaluatedBy: string;
      comments: string;
    }
  ];
}
```

---

### 9. Update Facilitator Availability
**Endpoint:** `PATCH /facilitators/:id/availability`

**Description:** Set facilitator's work hours and availability

**Request Body:**
```typescript
{
  availability: {
    monday?: { start: '09:00', end: '17:00' };
    tuesday?: { start: '09:00', end: '17:00' };
    wednesday?: { start: '09:00', end: '17:00' };
    thursday?: { start: '09:00', end: '17:00' };
    friday?: { start: '09:00', end: '17:00' };
    saturday?: { start: '10:00', end: '12:00' };
    sunday?: null;  // Unavailable
  };
  timeZone?: string;
}
```

**Response:** Updated Facilitator object with new availability

---

### 10. Get Facilitator Schedule
**Endpoint:** `GET /facilitators/:id/schedule`

**Description:** Get facilitator's teaching schedule

**Query Parameters:**
```typescript
{
  from?: Date;
  to?: Date;
  format?: 'CALENDAR' | 'LIST';
}
```

**Response:**
```typescript
{
  schedule: [
    {
      date: Date;
      dayOfWeek: string;
      classes: [
        {
          id: string;
          className: string;
          course: string;
          startTime: string;
          endTime: string;
          room: string;
          enrolledStudents: number;
        }
      ];
    }
  ];
}
```

---

### 11. Update Performance Rating
**Endpoint:** `PATCH /facilitators/:id/performance`

**Description:** Update facilitator's performance rating (admin only)

**Request Body:**
```typescript
{
  performanceRating: number;  // 0-5.0
  evaluationDate: Date;
  evaluationReason: string;
  comments?: string;
}
```

**Validation Rules:**
- Rating must be between 0 and 5.0
- Admin/Manager can only update

**Response:** Updated performance data

---

### 12. Deactivate Facilitator
**Endpoint:** `DELETE /facilitators/:id`

**Description:** Deactivate facilitator account (admin only)

**Business Rules:**
- Soft delete (mark as INACTIVE)
- All current class assignments are reassigned
- Facilitator cannot login
- Audit trail is maintained

---

## Data Transfer Objects (DTOs)

### CreateFacilitatorDto
```typescript
export class CreateFacilitatorDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password: string;

  @Length(2, 100)
  fullName: string;

  @Matches(/^\+?[1-9]\d{1,14}$/)
  phone: string;

  @Length(2, 100)
  specialization: string;

  @Length(2, 200)
  qualification: string;

  @IsDateString()
  @IsNotFuture()
  hireDate: Date;

  @IsOptional()
  @Length(2, 100)
  department?: string;
}
```

### UpdateFacilitatorDto
```typescript
export class UpdateFacilitatorDto {
  @IsOptional()
  @Length(2, 100)
  fullName?: string;

  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  phone?: string;

  @IsOptional()
  @Length(2, 100)
  specialization?: string;

  @IsOptional()
  @Length(2, 200)
  qualification?: string;

  @IsOptional()
  @Length(2, 100)
  department?: string;

  @IsOptional()
  @Type(() => Object)
  availability?: object;
}
```

### FacilitatorResponseDto
```typescript
export class FacilitatorResponseDto {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  specialization: string;
  qualification: string;
  hireDate: Date;
  department?: string;
  status: string;
  performanceRating: number;
  totalClassesAssigned: number;
  totalStudentsTaught: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Service Methods

### FacilitatorsService

```typescript
export class FacilitatorsService {
  constructor(
    @InjectRepository(Facilitator) private facilitatorRepo: Repository<Facilitator>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Class) private classRepo: Repository<Class>,
    private usersService: UsersService,
    private notificationService: NotificationService,
  ) {}

  async createFacilitator(dto: CreateFacilitatorDto): Promise<Facilitator>
  async findAll(page: number, limit: number, filters: any): Promise<{ data: Facilitator[]; total: number; }>
  async findById(id: string): Promise<Facilitator>
  async updateFacilitator(id: string, dto: UpdateFacilitatorDto): Promise<Facilitator>
  async updateStatus(id: string, status: string, reason?: string): Promise<Facilitator>
  async getClasses(facilitatorId: string, filters?: any): Promise<Class[]>
  async getStudents(facilitatorId: string, classId?: string): Promise<Student[]>
  async getPerformanceMetrics(facilitatorId: string): Promise<any>
  async updatePerformanceRating(facilitatorId: string, rating: number): Promise<Facilitator>
  async updateAvailability(facilitatorId: string, availability: object): Promise<Facilitator>
  async getSchedule(facilitatorId: string, from?: Date, to?: Date): Promise<any>
  async assignClass(facilitatorId: string, classId: string): Promise<Class>
  async removeClassAssignment(facilitatorId: string, classId: string): Promise<void>
  async updateStats(facilitatorId: string): Promise<void>
  async searchFacilitators(query: string, limit: number): Promise<Facilitator[]>
  async deleteFacilitator(id: string): Promise<void>
}
```

---

## Business Logic & Workflows

### Facilitator Onboarding Workflow
1. Admin registers facilitator with credentials
2. User account is created with FACILITATOR role
3. Facilitator record is linked to User
4. Welcome email with login credentials is sent
5. Performance rating initialized to 0
6. Status set to ACTIVE
7. Facilitator updates availability and specialization
8. Facilitator is ready to receive class assignments

### Class Assignment Workflow
1. Admin assigns class to facilitator
2. System verifies:
   - Facilitator is ACTIVE
   - No schedule conflict
   - Facilitator specialization matches (soft check)
3. Class is linked to facilitator
4. Facilitator receives notification
5. Students are notified of facilitator assignment
6. Statistics are updated (totalClassesAssigned)

### Performance Evaluation Workflow
1. Admin/Manager initiates evaluation
2. System collects metrics:
   - Average student grades in facilitator's classes
   - Student pass rates
   - Class completion rates
   - Student feedback/ratings
3. Performance rating is updated
4. Evaluation is logged with timestamp
5. Facilitator receives notification
6. Historical evaluations are maintained

### Leave/Status Change Workflow
1. Facilitator requests leave or admin initiates
2. Status is changed to ON_LEAVE or INACTIVE
3. Current class assignments are evaluated:
   - Short leave: Classes continue, backup facilitator assigned if needed
   - Long leave: Classes may be reassigned
4. Audit entry is created
5. Relevant stakeholders are notified
6. Facilitator access remains (data retrieval only if ON_LEAVE)

---

## Validation Rules

### Specialization
- Required field
- Must be from predefined list or allow custom values
- Minimum 2, maximum 100 characters

### Qualification
- Required field
- Examples: "B.Sc", "M.Sc", "Ph.D", "Diploma"
- Minimum 2, maximum 200 characters

### Hire Date
- Cannot be in the future
- Typically in the past
- Used to calculate experience

### Phone
- Standard validation (10-15 digits)
- International format supported

### Availability
- Hours must be in 24-hour format (HH:MM)
- Start time must be before end time
- No negative durations

### Performance Rating
- Must be 0.0 to 5.0
- Only admin/manager can update
- Changes are logged with reason

---

## Access Control

| Operation | Facilitator | Student | Manager | Admin |
|-----------|------------|---------|---------|-------|
| View own profile | ✅ | ✗ | ✗ | ✗ |
| View all facilitators | ✗ | ✗ | ✅ | ✅ |
| Create facilitator | ✗ | ✗ | ✅ | ✅ |
| Update own profile | ✅ | ✗ | ✗ | ✗ |
| Update any facilitator | ✗ | ✗ | ✅ | ✅ |
| Change status | ✗ | ✗ | ✗ | ✅ |
| Assign classes | ✗ | ✗ | ✅ | ✅ |
| View performance | ✅ | ✗ | ✅ | ✅ |
| Update performance rating | ✗ | ✗ | ✗ | ✅ |

---

## Integration Points

### With Other Modules
- **Users Module:** Facilitator profile relies on User entity
- **Classes Module:** Facilitators are assigned to classes
- **Students Module:** Facilitators teach students
- **Grades Module:** Facilitators submit grades
- **Attendance Module:** Facilitators mark attendance
- **Notifications Module:** Facilitators receive class/assignment notifications

### Events Triggered
- `facilitator.created` → Send welcome email with credentials
- `facilitator.assigned-to-class` → Notify facilitator
- `facilitator.status-changed` → Notify all parties
- `facilitator.performance-evaluated` → Notify facilitator
- `facilitator.deactivated` → Revoke login access

---

## Error Handling

| Error Code | Status | Scenario |
|-----------|--------|----------|
| FACILITATOR_NOT_FOUND | 404 | ID doesn't exist |
| EMAIL_ALREADY_EXISTS | 409 | Duplicate email |
| INVALID_STATUS_TRANSITION | 400 | Invalid status change |
| SCHEDULE_CONFLICT | 400 | Class assignment has time conflict |
| WEAK_PASSWORD | 400 | Password doesn't meet requirements |
| INACTIVE_FACILITATOR | 403 | Cannot assign to INACTIVE facilitator |
| INSUFFICIENT_PERMISSIONS | 403 | User lacks permission |

---

## Performance Considerations

### Indexing
```sql
CREATE INDEX idx_facilitator_user_id ON facilitators(user_id);
CREATE INDEX idx_facilitator_status ON facilitators(status);
CREATE INDEX idx_facilitator_department ON facilitators(department);
CREATE INDEX idx_facilitator_specialization ON facilitators(specialization);
CREATE INDEX idx_user_email ON users(email) WHERE role = 'FACILITATOR';
```

### Caching
- Cache facilitator profile for 10 minutes
- Cache performance metrics for 1 hour
- Cache schedule for 30 minutes
- Invalidate on update

### Query Optimization
- Eager load User relationship
- Use pagination for large lists
- Lazy load classes and students relationships
- Database-level sorting

---

## Summary

The Facilitator Management feature provides:
- ✅ Complete teacher lifecycle management
- ✅ Credential and qualification tracking
- ✅ Class assignment and scheduling
- ✅ Performance monitoring and evaluation
- ✅ Availability management
- ✅ Integration with teaching operations
- ✅ Comprehensive audit trails
