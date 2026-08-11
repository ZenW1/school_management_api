# 7. Admin Dashboard & Reporting Feature

## Overview
The Admin Dashboard & Reporting feature provides administrators and managers with comprehensive visibility into school operations through real-time analytics, KPI tracking, and customizable reports. This enables data-driven decision making and operational monitoring.

---

## Feature Scope

### Core Responsibilities
- Real-time dashboard with key metrics
- KPI tracking and monitoring
- Performance analytics (students, facilitators, courses)
- Report generation and scheduling
- Data export (CSV, Excel, PDF)
- Trend analysis and forecasting
- Custom dashboard creation
- Audit logging and compliance reporting

---

## Dashboard Metrics & KPIs

### Student Metrics
- Total active students
- New enrollments (this month/quarter/year)
- Student status distribution (Active, Graduated, Suspended)
- Average GPA by class/semester
- At-risk students count (low attendance/grades)
- Enrollment growth trend

### Facilitator Metrics
- Total active facilitators
- Classes per facilitator (average)
- Student-to-facilitator ratio
- Facilitator performance ratings (average)
- Classes with pending grades
- Workload distribution

### Academic Metrics
- Total courses
- Active classes
- Average class capacity utilization
- Course completion rate
- Grade distribution (A, B, C, D, F)
- Pass rate by course

### Operational Metrics
- Attendance rate (overall)
- Material upload count (this month)
- Late submission rate
- System uptime
- User login activity
- Storage usage

---

## API Endpoints

### 1. Get Dashboard Overview
**Endpoint:** `GET /dashboard/overview`

**Query Parameters:**
```typescript
{
  period?: 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';  // Default: MONTH
  from?: Date;
  to?: Date;
}
```

**Response:**
```typescript
{
  period: { from: Date; to: Date; };
  summary: {
    totalStudents: number;
    activeStudents: number;
    totalFacilitators: number;
    activeFacilitators: number;
    totalClasses: number;
    activeClasses: number;
    totalCourses: number;
  };
  newEnrollments: number;
  averageGpa: number;
  attendanceRate: number;
  passRate: number;
  systemHealth: {
    uptime: number;  // Percentage
    activeSessions: number;
    lastSync: Date;
  };
  alerts: [
    {
      id: string;
      level: 'INFO' | 'WARNING' | 'CRITICAL';
      message: string;
      timestamp: Date;
    }
  ];
  timestamp: Date;
}
```

---

### 2. Get Student Analytics
**Endpoint:** `GET /dashboard/students`

**Query Parameters:**
```typescript
{
  period?: string;
  groupBy?: 'CLASS' | 'SEMESTER' | 'STATUS';
  includeAtRisk?: boolean;
}
```

**Response:**
```typescript
{
  totalStudents: number;
  byStatus: {
    ACTIVE: number;
    INACTIVE: number;
    GRADUATED: number;
    SUSPENDED: number;
  };
  enrollment: {
    newThisPeriod: number;
    growth: number;  // Percentage change
  };
  academic: {
    averageGpa: number;
    gpaDistribution: {
      'A+': number;
      'A': number;
      'B': number;
      'C': number;
      'D': number;
      'F': number;
    };
    passingStudents: number;
    failingStudents: number;
  };
  atRisk: {
    lowAttendance: number;
    lowGrades: number;
    lateSubmissions: number;
  };
  trends: {
    enrollmentTrend: number[];  // Last N weeks
    gpaTrend: number[];
    attendanceTrend: number[];
  };
}
```

---

### 3. Get Facilitator Analytics
**Endpoint:** `GET /dashboard/facilitators`

**Query Parameters:**
```typescript
{
  period?: string;
  department?: string;
}
```

**Response:**
```typescript
{
  totalFacilitators: number;
  byStatus: {
    ACTIVE: number;
    ON_LEAVE: number;
    INACTIVE: number;
  };
  classLoad: {
    averageClassesPerFacilitator: number;
    averageStudentsPerFacilitator: number;
    distribution: [
      {
        facilitatorId: string;
        name: string;
        classesAssigned: number;
        studentsCount: number;
        performanceRating: number;
      }
    ];
  };
  performance: {
    averageRating: number;
    topPerformers: [
      {
        id: string;
        name: string;
        rating: number;
        students: number;
      }
    ];
    pendingEvaluations: number;
  };
  workload: {
    highLoad: number;      // > 5 classes
    normalLoad: number;    // 3-5 classes
    underutilized: number; // < 3 classes
  };
}
```

---

### 4. Get Course Analytics
**Endpoint:** `GET /dashboard/courses`

**Query Parameters:**
```typescript
{
  period?: string;
  semester?: string;
}
```

**Response:**
```typescript
{
  totalCourses: number;
  activeCourses: number;
  classes: {
    totalClasses: number;
    activeClasses: number;
    completedClasses: number;
    averageCapacityUtilization: number;
  };
  academic: {
    averageGrade: number;
    gradeDistribution: object;
    passRateByCourse: [
      {
        courseId: string;
        courseName: string;
        passRate: number;
        averageGrade: number;
        students: number;
      }
    ];
  };
  enrollment: {
    totalEnrollments: number;
    averageClassSize: number;
    classFilledPercentage: number;
  };
}
```

---

### 5. Get Attendance Analytics
**Endpoint:** `GET /dashboard/attendance`

**Query Parameters:**
```typescript
{
  period?: string;
  classId?: string;
}
```

**Response:**
```typescript
{
  overallAttendanceRate: number;
  byStatus: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  byClass: [
    {
      classId: string;
      className: string;
      attendanceRate: number;
      absenceRate: number;
    }
  ];
  atRiskStudents: {
    count: number;
    threshold: number;
    students: [
      {
        id: string;
        name: string;
        attendanceRate: number;
        lastPresent: Date;
      }
    ];
  };
  trends: number[];  // Attendance rate by week
}
```

---

### 6. Get Grade Analytics
**Endpoint:** `GET /dashboard/grades`

**Query Parameters:**
```typescript
{
  period?: string;
  classId?: string;
}
```

**Response:**
```typescript
{
  overallPassRate: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  averageGpa: number;
  gpaDistribution: [
    {
      gpaRange: string;
      count: number;
    }
  ];
  byClass: [
    {
      classId: string;
      className: string;
      averageGrade: number;
      passRate: number;
      studentCount: number;
    }
  ];
  assignmentMetrics: {
    totalAssignments: number;
    averageSubmissionRate: number;
    lateSubmissionRate: number;
  };
}
```

---

### 7. Generate Report
**Endpoint:** `POST /reports/generate`

**Request Body:**
```typescript
{
  reportType: 'STUDENT_PERFORMANCE' | 'FACILITATOR_PERFORMANCE' | 'ENROLLMENT' | 
              'ATTENDANCE' | 'CUSTOM';
  parameters: {
    from?: Date;
    to?: Date;
    classId?: string;
    courseId?: string;
    filterBy?: string;
    groupBy?: string;
  };
  format: 'PDF' | 'XLSX' | 'CSV';
  schedule?: {
    recurring?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
    recipients?: string[];  // Email addresses
  };
}
```

**Response:**
```typescript
{
  id: string;
  reportType: string;
  status: 'GENERATING' | 'READY' | 'FAILED';
  downloadUrl?: string;
  createdAt: Date;
  expiresAt: Date;  // 7 days
}
```

---

### 8. Get Report History
**Endpoint:** `GET /reports`

**Query Parameters:**
```typescript
{
  type?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  reports: [
    {
      id: string;
      type: string;
      status: string;
      format: string;
      createdBy: User;
      createdAt: Date;
      downloadUrl?: string;
    }
  ];
  total: number;
  page: number;
  limit: number;
}
```

---

### 9. Download Report
**Endpoint:** `GET /reports/:id/download`

**Response:**
- File download (PDF, Excel, CSV)

---

### 10. Schedule Recurring Report
**Endpoint:** `POST /reports/schedule`

**Request Body:**
```typescript
{
  reportType: string;
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  dayOfWeek?: string;  // For weekly: Monday, Tuesday, etc.
  dayOfMonth?: number; // For monthly: 1-31
  recipients: string[]; // Email addresses
  format: 'PDF' | 'XLSX';
}
```

**Response:**
```typescript
{
  id: string;
  reportType: string;
  frequency: string;
  recipients: string[];
  nextRun: Date;
  createdAt: Date;
}
```

---

### 11. Get System Health
**Endpoint:** `GET /dashboard/system-health`

**Response:**
```typescript
{
  uptime: number;          // Percentage
  responseTime: number;    // ms
  databaseHealth: {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    connections: number;
    queryTime: number;
  };
  storageUsage: {
    used: string;          // e.g., "45.2 GB"
    total: string;         // e.g., "100 GB"
    percentageUsed: number;
  };
  activeSessions: number;
  lastBackup: Date;
  alerts: [
    {
      severity: 'INFO' | 'WARNING' | 'CRITICAL';
      message: string;
    }
  ];
}
```

---

### 12. Get Audit Log
**Endpoint:** `GET /audit-logs`

**Query Parameters:**
```typescript
{
  action?: string;          // CREATE, UPDATE, DELETE
  entityType?: string;      // Student, Course, etc.
  userId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  logs: [
    {
      id: string;
      timestamp: Date;
      user: { id: string; fullName: string; email: string; };
      action: string;
      entityType: string;
      entityId: string;
      changes?: {
        before: object;
        after: object;
      };
      ipAddress?: string;
    }
  ];
  total: number;
  page: number;
}
```

---

### 13. Get Custom Dashboard
**Endpoint:** `GET /dashboards/:id`

**Response:**
```typescript
{
  id: string;
  name: string;
  description?: string;
  owner: User;
  widgets: [
    {
      id: string;
      type: string;  // CHART, KPI, TABLE, etc.
      title: string;
      metric: string;
      config: object;
      position: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }
  ];
  isPublic: boolean;
  sharedWith?: User[];
  lastModified: Date;
}
```

---

### 14. Create Custom Dashboard
**Endpoint:** `POST /dashboards`

**Request Body:**
```typescript
{
  name: string;
  description?: string;
  widgets: [
    {
      type: string;
      title: string;
      metric: string;
      config: object;
      position: object;
    }
  ];
  isPublic?: boolean;
}
```

---

## Service Methods

### DashboardService

```typescript
export class DashboardService {
  async getOverview(period?: string, from?: Date, to?: Date): Promise<any>
  async getStudentAnalytics(period?: string, filters?: any): Promise<any>
  async getFacilitatorAnalytics(period?: string, filters?: any): Promise<any>
  async getCourseAnalytics(period?: string, filters?: any): Promise<any>
  async getAttendanceAnalytics(period?: string, filters?: any): Promise<any>
  async getGradeAnalytics(period?: string, filters?: any): Promise<any>
  async getSystemHealth(): Promise<any>
  async getAlerts(): Promise<any>
  async createAlert(condition: string, threshold: number): Promise<Alert>
}
```

### ReportService

```typescript
export class ReportService {
  async generateReport(type: string, parameters: any, format: string): Promise<any>
  async getReportHistory(filters?: any): Promise<Report[]>
  async downloadReport(id: string): Promise<Buffer>
  async scheduleRecurringReport(config: any): Promise<ScheduledReport>
  async exportData(entityType: string, format: string, filters?: any): Promise<Buffer>
  async deleteOldReports(days?: number): Promise<void>
}
```

### AuditService

```typescript
export class AuditService {
  async logAction(action: string, entityType: string, entityId: string, userId: string, changes?: any): Promise<void>
  async getAuditLogs(filters?: any): Promise<AuditLog[]>
  async getComplianceReport(from: Date, to: Date): Promise<any>
}
```

---

## Report Types

### 1. Student Performance Report
- GPA distribution
- Pass/fail breakdown by class
- Top/bottom performers
- Attendance correlation
- Engagement metrics

### 2. Facilitator Performance Report
- Class effectiveness
- Student feedback/ratings
- Grading consistency
- Class completion metrics
- Workload analysis

### 3. Enrollment Report
- Enrollment trends
- Retention rates
- Course popularity
- Capacity utilization
- Forecast for next semester

### 4. Attendance Report
- Overall attendance statistics
- At-risk students
- Absence patterns
- Trend analysis
- Correlations with performance

### 5. Custom Report
- User-defined parameters
- Custom filters and grouping
- Selected metrics/data

---

## Visualization Options

### Chart Types
- Line charts (trends)
- Bar charts (comparisons)
- Pie charts (distribution)
- Heatmaps (patterns)
- Scatter plots (correlations)
- Gauge charts (KPIs)

### Dashboard Widgets
- KPI Cards (current value + trend)
- Line/Bar Charts
- Tables with sorting/filtering
- Progress bars
- Status indicators
- Text blocks

---

## Access Control

| Operation | Manager | Admin |
|-----------|---------|-------|
| View overview | ✅ | ✅ |
| View analytics | ✅ | ✅ |
| Generate reports | ✅ | ✅ |
| Download reports | ✅ | ✅ |
| Schedule reports | ✅ | ✅ |
| View audit logs | ✗ | ✅ |
| Create custom dashboards | ✅ | ✅ |
| Configure alerts | ✗ | ✅ |
| System health | ✗ | ✅ |

---

## Alert System

### Alert Types
- Low attendance threshold crossed
- Low GPA threshold crossed
- High assignment late rate
- Unusual grade distribution
- Facilitator workload imbalance
- Storage quota warning
- System health issues

### Alert Actions
- Email notification
- In-app notification
- SMS (optional)
- Dashboard highlight
- Automatic escalation after N days

---

## Performance Considerations

### Caching Strategy
- Cache dashboard data: 5 minutes
- Cache analytics: 15 minutes
- Cache audit logs: 30 minutes
- Cache system health: 1 minute

### Aggregation Strategy
- Use materialized views for complex aggregations
- Scheduled jobs (nightly) for heavy computations
- Real-time aggregation for KPIs only
- Incremental updates for trends

### Query Optimization
- Database indexing on time fields
- Partition audit logs by date
- Batch report generation
- Asynchronous processing for large reports

---

## Summary

The Admin Dashboard & Reporting feature provides:
- ✅ Real-time overview of school operations
- ✅ Comprehensive analytics across all domains
- ✅ Multiple report types and formats
- ✅ Custom dashboard creation
- ✅ Scheduled recurring reports
- ✅ System health monitoring
- ✅ Audit trail for compliance
- ✅ Data-driven decision making support
