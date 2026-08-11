# 6. Attendance Tracking Feature

## Overview
The Attendance Tracking feature enables facilitators to mark student attendance for each class session and provides comprehensive attendance analytics and reporting for monitoring student participation and identifying at-risk students.

---

## Feature Scope

### Core Responsibilities
- Daily attendance marking
- Multiple attendance statuses (present, absent, late, excused)
- Attendance reports and statistics
- At-risk student identification (low attendance)
- Attendance analytics and trends
- Bulk attendance import
- Attendance history and audit trail
- Performance impact analysis

### Key Entities

#### Attendance Entity
```typescript
@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Class, { eager: true })
  @JoinColumn()
  class: Class;

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn()
  student: Student;

  @Column()
  date: Date;

  @Column({
    type: 'enum',
    enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
    default: 'PRESENT'
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;  // Reason for absence, late arrival note

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;  // Has facilitator confirmed

  @ManyToOne(() => User)
  @JoinColumn({ name: 'marked_by' })
  markedBy: User;

  @CreateDateColumn()
  markedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'json', nullable: true })
  metadata?: {
    timeIn?: string;      // Time student arrived
    timeOut?: string;     // Time student left
    lateMinutes?: number; // Minutes late
  };
}
```

---

## API Endpoints

### 1. Mark Attendance for Single Student
**Endpoint:** `POST /attendance`

**Request Body:**
```typescript
{
  classId: string;
  studentId: string;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  metadata?: {
    timeIn?: string;
    timeOut?: string;
    lateMinutes?: number;
  };
}
```

**Validation Rules:**
- Date cannot be in future
- Date cannot be before class start date
- Date must be a class session day
- Status must be valid
- Only facilitator of class or admin can mark
- Cannot mark same student twice for same date

**Response:**
```typescript
{
  id: string;
  student: { fullName: string; };
  class: { className: string; };
  date: Date;
  status: string;
  remarks?: string;
  markedAt: Date;
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Validation error (future date, duplicate)
- `409 Conflict` - Already marked for this date

---

### 2. Mark Attendance for Class Session
**Endpoint:** `POST /classes/:classId/attendance`

**Request Body:**
```typescript
{
  date: Date;
  attendances: [
    {
      studentId: string;
      status: string;
      remarks?: string;
    }
  ];
}
```

**Business Rules:**
- Bulk mark entire class at once
- More efficient for taking attendance
- All validations apply to each record
- Transaction: all or nothing

**Response:**
```typescript
{
  classId: string;
  date: Date;
  marked: number;
  skipped: number;
  message: string;
}
```

---

### 3. Get Attendance Record
**Endpoint:** `GET /attendance/:id`

**Response:**
```typescript
{
  id: string;
  student: Student;
  class: Class;
  date: Date;
  status: string;
  remarks?: string;
  isVerified: boolean;
  markedBy: User;
  markedAt: Date;
  metadata?: object;
}
```

---

### 4. Update Attendance Record
**Endpoint:** `PATCH /attendance/:id`

**Request Body:**
```typescript
{
  status?: string;
  remarks?: string;
  isVerified?: boolean;  // Only admin can mark verified
  metadata?: object;
}
```

**Business Rules:**
- Only facilitator of class or admin can update
- Updates are logged for audit
- Verification requires admin

---

### 5. Delete Attendance Record
**Endpoint:** `DELETE /attendance/:id`

**Business Rules:**
- Only facilitator or admin can delete
- Cannot delete if more than 7 days old (soft delete)
- Deletion is logged

---

### 6. Get Class Attendance
**Endpoint:** `GET /classes/:classId/attendance`

**Query Parameters:**
```typescript
{
  from?: Date;
  to?: Date;
  status?: string;        // Filter by status
  verified?: boolean;
  format?: 'CALENDAR' | 'LIST' | 'GRID';
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  class: { name: string; };
  period: { from: Date; to: Date; };
  attendances: [
    {
      date: Date;
      dayOfWeek: string;
      records: [
        {
          student: { id: string; fullName: string; };
          status: string;
          remarks?: string;
        }
      ];
    }
  ];
  stats: {
    totalSessions: number;
    markedSessions: number;
    pendingSessions: number;
  };
}
```

---

### 7. Get Student Attendance
**Endpoint:** `GET /students/:studentId/attendance`

**Query Parameters:**
```typescript
{
  classId?: string;
  from?: Date;
  to?: Date;
  includeStats?: boolean;  // Calculate metrics
  includePercentage?: boolean;
}
```

**Response:**
```typescript
{
  student: Student;
  attendanceRecords: [
    {
      id: string;
      class: { id: string; name: string; };
      date: Date;
      status: string;
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
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';  // Based on threshold
  };
}
```

---

### 8. Get Attendance Statistics
**Endpoint:** `GET /classes/:classId/attendance/statistics`

**Query Parameters:**
```typescript
{
  from?: Date;
  to?: Date;
  byStudent?: boolean;   // Group by student
  byDate?: boolean;      // Group by date
}
```

**Response:**
```typescript
{
  class: { name: string; };
  summary: {
    totalSessions: number;
    averageAttendance: number;
    presentPercentage: number;
    absentPercentage: number;
    latePercentage: number;
    excusedPercentage: number;
  };
  byStudent: [
    {
      student: { id: string; fullName: string; };
      present: number;
      absent: number;
      late: number;
      excused: number;
      percentage: number;
      riskLevel: string;
    }
  ];
  byDate: [
    {
      date: Date;
      dayOfWeek: string;
      present: number;
      absent: number;
      late: number;
      excused: number;
    }
  ];
}
```

---

### 9. Get At-Risk Students
**Endpoint:** `GET /classes/:classId/attendance/at-risk`

**Query Parameters:**
```typescript
{
  threshold?: number;  // Default: 75% attendance
  limit?: number;
}
```

**Response:**
```typescript
{
  atRiskStudents: [
    {
      student: { id: string; fullName: string; email: string; };
      attendancePercentage: number;
      absences: number;
      lastPresent: Date;
      riskLevel: 'MEDIUM' | 'HIGH' | 'CRITICAL';
      trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    }
  ];
  threshold: number;
  totalAtRisk: number;
}
```

---

### 10. Bulk Import Attendance
**Endpoint:** `POST /attendance/bulk-import`

**Request:** Multipart form-data

**Form Fields:**
```typescript
{
  classId: string;
  file: File;  // CSV file
  dateFormat?: string;  // Default: YYYY-MM-DD
  // CSV columns: StudentID, Date, Status, Remarks
}
```

**CSV Format:**
```
StudentID,Date,Status,Remarks
STU001,2024-01-15,PRESENT,
STU002,2024-01-15,LATE,Arrived 10 minutes late
STU003,2024-01-15,ABSENT,Medical appointment
```

**Validation Rules:**
- File must be CSV
- All rows validated before importing
- Transaction: all or nothing
- Duplicates rejected
- Invalid rows reported

**Response:**
```typescript
{
  imported: number;
  failed: number;
  errors?: [
    {
      row: number;
      reason: string;
    }
  ];
  message: string;
}
```

---

### 11. Export Attendance
**Endpoint:** `GET /classes/:classId/attendance/export`

**Query Parameters:**
```typescript
{
  format?: 'CSV' | 'XLSX' | 'PDF';  // Default: CSV
  from?: Date;
  to?: Date;
}
```

**Response:**
- File download (CSV/Excel/PDF)

---

### 12. Get Attendance Trends
**Endpoint:** `GET /classes/:classId/attendance/trends`

**Query Parameters:**
```typescript
{
  weeks?: number;  // Last N weeks (default: 8)
}
```

**Response:**
```typescript
{
  class: { name: string; };
  trends: [
    {
      week: number;
      startDate: Date;
      endDate: Date;
      averageAttendance: number;
      absentCount: number;
      lateCount: number;
      trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
    }
  ];
  overallTrend: string;
}
```

---

### 13. Generate Attendance Report
**Endpoint:** `POST /attendance/report`

**Request Body:**
```typescript
{
  classId: string;
  from: Date;
  to: Date;
  reportType: 'SUMMARY' | 'DETAILED' | 'AT_RISK';
  format?: 'PDF' | 'XLSX';
}
```

**Response:**
- Generated report file URL

---

## Data Transfer Objects (DTOs)

### MarkAttendanceDto
```typescript
export class MarkAttendanceDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  studentId: string;

  @IsDateString()
  @IsNotFuture()
  date: Date;

  @IsIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
  status: string;

  @IsOptional()
  @Length(0, 500)
  remarks?: string;

  @IsOptional()
  @Type(() => Object)
  metadata?: object;
}
```

### BulkMarkAttendanceDto
```typescript
export class BulkMarkAttendanceDto {
  @IsUUID()
  classId: string;

  @IsDateString()
  @IsNotFuture()
  date: Date;

  @Type(() => MarkAttendanceItemDto)
  @ValidateNested({ each: true })
  attendances: MarkAttendanceItemDto[];
}

export class MarkAttendanceItemDto {
  @IsUUID()
  studentId: string;

  @IsIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
  status: string;

  @IsOptional()
  remarks?: string;
}
```

---

## Service Methods

### AttendanceService

```typescript
export class AttendanceService {
  async markAttendance(dto: MarkAttendanceDto, markedBy: User): Promise<Attendance>
  async bulkMarkAttendance(dto: BulkMarkAttendanceDto, markedBy: User): Promise<any>
  async findById(id: string): Promise<Attendance>
  async updateAttendance(id: string, dto: UpdateAttendanceDto): Promise<Attendance>
  async deleteAttendance(id: string): Promise<void>
  async getClassAttendance(classId: string, from?: Date, to?: Date): Promise<Attendance[]>
  async getStudentAttendance(studentId: string, classId?: string, from?: Date, to?: Date): Promise<Attendance[]>
  async getClassStatistics(classId: string, from?: Date, to?: Date): Promise<any>
  async getStudentStatistics(studentId: string, classId: string): Promise<any>
  async getAtRiskStudents(classId: string, threshold?: number): Promise<any>
  async importAttendance(classId: string, file: Express.Multer.File): Promise<any>
  async exportAttendance(classId: string, format: string, from?: Date, to?: Date): Promise<Buffer>
  async getTrends(classId: string, weeks?: number): Promise<any>
  async generateReport(classId: string, from: Date, to: Date, type: string): Promise<string>
  async calculateAttendancePercentage(studentId: string, classId: string): Promise<number>
  async identifyAtRiskStudents(classId: string): Promise<any>
}
```

---

## Business Logic

### Attendance Status Logic
```
PRESENT    → Student was present
ABSENT     → Student was not present (unexcused)
LATE       → Student arrived late (can convert to PRESENT or ABSENT)
EXCUSED    → Absence is excused (doesn't count as absence)

For attendance percentage calculation:
  percentage = (PRESENT + EXCUSED) / total_sessions × 100
  
For at-risk detection:
  if percentage < 75%:
    riskLevel = HIGH
  else if percentage < 85%:
    riskLevel = MEDIUM
  else:
    riskLevel = LOW
```

### Late Submission Penalty Integration
```
Some schools use attendance in grading:
  if attendance < 80%:
    grade_penalty = 2-5% (configurable)
  final_score = base_score × (1 - grade_penalty)
```

### Absence Notification
```
When ABSENT or LATE is marked:
  1. Record attendance
  2. If absent: check threshold
  3. If threshold exceeded: trigger alert
  4. Notify student and parent/guardian
  5. Notify facilitator if at-risk
  6. Log for audit
```

---

## Validation Rules

### Date Validation
- Cannot mark attendance for future dates
- Cannot mark attendance before class start date
- Cannot mark before class session occurs (if scheduling available)
- Cannot mark same student twice for same date

### Status Values
- PRESENT: Valid only if not marked before
- ABSENT: Can be unexcused
- LATE: Can be converted to PRESENT after threshold
- EXCUSED: Requires reason/remarks

### Remarks
- Optional field
- Should explain absence/late reason
- Max 500 characters
- Markdown not supported

---

## Access Control

| Operation | Student | Facilitator | Manager | Admin |
|-----------|---------|-------------|---------|-------|
| Mark attendance | ✗ | ✅ | ✗ | ✅ |
| View own attendance | ✅ | ✗ | ✗ | ✗ |
| View class attendance | ✗ | ✅ | ✅ | ✅ |
| Update attendance | ✗ | ✅ | ✗ | ✅ |
| Delete attendance | ✗ | ✅ | ✗ | ✅ |
| Export attendance | ✗ | ✅ | ✅ | ✅ |
| View at-risk list | ✗ | ✅ | ✅ | ✅ |
| Verify attendance | ✗ | ✗ | ✗ | ✅ |

---

## Integration Points

### With Other Modules
- **Classes Module:** Attendance per class/section
- **Students Module:** Individual attendance tracking
- **Grades Module:** May impact grading (attendance score)
- **Notifications Module:** Alerts for low attendance
- **Dashboard Module:** Attendance analytics

### Events Triggered
- `attendance.marked` → Log action
- `student.at-risk` → Trigger alert if threshold crossed
- `attendance.absence-excused` → Notify student
- `attendance.imported` → Validate and process

---

## Error Handling

| Error Code | Status | Scenario |
|-----------|--------|----------|
| DUPLICATE_ATTENDANCE | 409 | Already marked for date |
| FUTURE_DATE | 400 | Cannot mark future attendance |
| INVALID_STATUS | 400 | Invalid status value |
| CLASS_NOT_FOUND | 404 | Class doesn't exist |
| STUDENT_NOT_ENROLLED | 400 | Student not in class |
| IMPORT_FAILED | 400 | CSV import validation error |
| INSUFFICIENT_PERMISSIONS | 403 | Not facilitator of class |

---

## Performance Considerations

### Indexing
```sql
CREATE INDEX idx_attendance_class_id ON attendances(class_id);
CREATE INDEX idx_attendance_student_id ON attendances(student_id);
CREATE INDEX idx_attendance_date ON attendances(date);
CREATE INDEX idx_attendance_status ON attendances(status);
CREATE INDEX idx_attendance_class_student_date ON attendances(class_id, student_id, date);
```

### Caching
- Cache student attendance percentage: 1 hour
- Cache class statistics: 30 minutes
- Cache at-risk student list: 30 minutes
- Invalidate on update

### Batch Operations
- Bulk marking (transactional)
- CSV import processing
- Bulk status updates
- Batch report generation

---

## Summary

The Attendance Tracking feature provides:
- ✅ Flexible attendance marking (single, bulk, import)
- ✅ Multiple attendance statuses
- ✅ Comprehensive reporting and analytics
- ✅ At-risk student identification
- ✅ Attendance trends analysis
- ✅ Export in multiple formats
- ✅ Integration with academic operations
