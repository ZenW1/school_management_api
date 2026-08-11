# 8. Notifications & Communications Feature

## Overview
The Notifications & Communications feature enables school-wide announcements, targeted notifications, email delivery, and direct messaging between facilitators and students. This ensures timely communication of important information and maintains engagement throughout the school community.

---

## Feature Scope

### Core Responsibilities
- School-wide announcements
- Class-specific announcements
- Email notifications (automated and manual)
- In-app notifications and alerts
- Message center for direct communication
- Notification preferences management
- Delivery status tracking
- Communication history

### Key Entities

#### Announcement Entity
```typescript
@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;  // Markdown support

  @Column({
    type: 'enum',
    enum: ['SCHOOL_WIDE', 'CLASS_SPECIFIC', 'PERSONAL'],
    default: 'SCHOOL_WIDE'
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['STUDENTS', 'FACILITATORS', 'MANAGERS', 'ALL'],
    default: 'ALL'
  })
  targetAudience: string;

  @ManyToOne(() => Class, { nullable: true })
  @JoinColumn()
  targetClass?: Class;

  @Column({
    type: 'enum',
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  })
  priority: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column()
  publishedAt: Date;

  @Column({ nullable: true })
  expiresAt?: Date;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NotificationRecipient, recipient => recipient.announcement)
  recipients: NotificationRecipient[];
}
```

#### Notification Entity
```typescript
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  recipient: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ['ANNOUNCEMENT', 'GRADE', 'ASSIGNMENT', 'ATTENDANCE', 'SYSTEM', 'MESSAGE'],
    default: 'SYSTEM'
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['INFO', 'WARNING', 'ALERT', 'SUCCESS'],
    default: 'INFO'
  })
  severity: string;

  @Column({ nullable: true })
  relatedEntityId?: string;
  @Column({ nullable: true })
  relatedEntityType?: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Message Entity
```typescript
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  attachmentUrl?: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ default: false })
  isArchived: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## API Endpoints

### ANNOUNCEMENT ENDPOINTS

### 1. Create Announcement
**Endpoint:** `POST /announcements`

**Request Body:**
```typescript
{
  title: string;                    // 1-200 chars
  content: string;                  // Markdown support, 1-10000 chars
  type: string;                     // SCHOOL_WIDE, CLASS_SPECIFIC, PERSONAL
  targetAudience: string;           // STUDENTS, FACILITATORS, MANAGERS, ALL
  targetClassId?: string;           // Required if type is CLASS_SPECIFIC
  priority?: string;                // LOW, MEDIUM, HIGH (Default: MEDIUM)
  expiresAt?: Date;                 // Optional expiration
  sendEmail?: boolean;              // Send email to recipients (default: true)
}
```

**Validation Rules:**
- Title and content required
- Type and targetAudience valid enums
- If CLASS_SPECIFIC: targetClassId required
- Facilitator can only create CLASS_SPECIFIC for own class
- Admin/Manager can create all types
- ExpiresAt must be in future if set

**Response:**
```typescript
{
  id: string;
  title: string;
  type: string;
  targetAudience: string;
  priority: string;
  createdBy: { fullName: string; };
  publishedAt: Date;
  expiresAt?: Date;
  recipients: {
    total: number;
    emailSent: number;
    failed: number;
  };
  createdAt: Date;
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Validation error
- `403 Forbidden` - Insufficient permissions

---

### 2. List Announcements
**Endpoint:** `GET /announcements`

**Query Parameters:**
```typescript
{
  type?: string;
  audience?: string;
  priority?: string;
  active?: boolean;        // Not expired (default: true)
  classId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;         // publishedAt, priority
  sortOrder?: 'ASC' | 'DESC';
}
```

**Response:**
```typescript
{
  data: Announcement[];
  total: number;
  page: number;
  limit: number;
}
```

---

### 3. Get Announcement Details
**Endpoint:** `GET /announcements/:id`

**Response:**
```typescript
{
  id: string;
  title: string;
  content: string;
  type: string;
  targetAudience: string;
  priority: string;
  createdBy: User;
  publishedAt: Date;
  expiresAt?: Date;
  viewCount: number;
  recipients: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4. Update Announcement
**Endpoint:** `PATCH /announcements/:id`

**Request Body:**
```typescript
{
  title?: string;
  content?: string;
  priority?: string;
  expiresAt?: Date;
  // Cannot change type, audience, or class
}
```

**Business Rules:**
- Only creator or admin can update
- Cannot change type or audience after publication
- Updated announcements are re-sent via email if requested

---

### 5. Delete Announcement
**Endpoint:** `DELETE /announcements/:id`

**Business Rules:**
- Only creator or admin can delete
- Soft delete: marked as archived
- Recipients still see it in history

---

### 6. Mark Announcement as Read
**Endpoint:** `POST /announcements/:id/read`

**Business Rules:**
- Tracks which users have read the announcement
- Increments viewCount
- Records timestamp

---

### NOTIFICATION ENDPOINTS

### 7. Get My Notifications
**Endpoint:** `GET /notifications`

**Query Parameters:**
```typescript
{
  unreadOnly?: boolean;   // Default: false
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
  notifications: Notification[];
  unreadCount: number;
  total: number;
  page: number;
}
```

---

### 8. Mark Notification as Read
**Endpoint:** `PATCH /notifications/:id/read`

**Response:**
```typescript
{
  id: string;
  isRead: boolean;
  readAt: Date;
}
```

---

### 9. Mark All Notifications as Read
**Endpoint:** `PATCH /notifications/read-all`

**Response:**
```typescript
{
  markedCount: number;
}
```

---

### 10. Delete Notification
**Endpoint:** `DELETE /notifications/:id`

**Response:**
- `204 No Content` - Success

---

### 11. Get Notification Preferences
**Endpoint:** `GET /notification-preferences`

**Response:**
```typescript
{
  userId: string;
  emailNotifications: {
    announcements: boolean;
    grades: boolean;
    assignments: boolean;
    attendance: boolean;
    messages: boolean;
  };
  inAppNotifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  frequency?: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
  quietHours?: {
    startTime: string;
    endTime: string;
  };
}
```

---

### 12. Update Notification Preferences
**Endpoint:** `PATCH /notification-preferences`

**Request Body:**
```typescript
{
  emailNotifications?: object;
  inAppNotifications?: object;
  frequency?: string;
  quietHours?: object;
}
```

**Response:** Updated preferences

---

### MESSAGE ENDPOINTS

### 13. Send Message
**Endpoint:** `POST /messages`

**Request Body:**
```typescript
{
  recipientId: string;
  content: string;                // Max 5000 chars
  attachmentUrl?: string;         // S3 URL to file
}
```

**Validation Rules:**
- Recipient must exist
- Recipient must not be self
- Content required and non-empty
- Attachment optional

**Response:**
```typescript
{
  id: string;
  sender: { id: string; fullName: string; };
  recipient: { id: string; fullName: string; };
  content: string;
  attachmentUrl?: string;
  createdAt: Date;
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Validation error
- `404 Not Found` - Recipient not found

---

### 14. Get Conversation
**Endpoint:** `GET /messages/conversations/:userId`

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  messages: [
    {
      id: string;
      sender: User;
      recipient: User;
      content: string;
      attachmentUrl?: string;
      isRead: boolean;
      readAt?: Date;
      createdAt: Date;
    }
  ];
  total: number;
  page: number;
  unreadCount: number;
}
```

---

### 15. Get All Conversations
**Endpoint:** `GET /messages/conversations`

**Query Parameters:**
```typescript
{
  includeArchived?: boolean;
  sortBy?: string;            // lastMessage, unreadCount
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  conversations: [
    {
      participantId: string;
      participantName: string;
      participantEmail: string;
      lastMessage: string;
      lastMessageTime: Date;
      unreadCount: number;
      isArchived: boolean;
    }
  ];
  total: number;
}
```

---

### 16. Mark Message as Read
**Endpoint:** `PATCH /messages/:id/read`

**Response:**
```typescript
{
  id: string;
  isRead: boolean;
  readAt: Date;
}
```

---

### 17. Archive Conversation
**Endpoint:** `PATCH /messages/conversations/:userId/archive`

**Response:**
```typescript
{
  conversationId: string;
  isArchived: boolean;
}
```

---

### 18. Delete Message
**Endpoint:** `DELETE /messages/:id`

**Business Rules:**
- Only sender can delete
- Soft delete: mark as deleted, don't remove

---

### 19. Search Messages
**Endpoint:** `GET /messages/search`

**Query Parameters:**
```typescript
{
  q: string;                  // Search query
  from?: string;              // Sender/recipient ID
  from?: Date;
  to?: Date;
}
```

**Response:**
```typescript
{
  results: Message[];
  total: number;
}
```

---

## Service Methods

### AnnouncementService

```typescript
export class AnnouncementService {
  async createAnnouncement(dto: CreateAnnouncementDto, createdBy: User): Promise<Announcement>
  async findAll(page: number, limit: number, filters: any): Promise<{ data: Announcement[]; total: number; }>
  async findById(id: string): Promise<Announcement>
  async updateAnnouncement(id: string, dto: UpdateAnnouncementDto): Promise<Announcement>
  async deleteAnnouncement(id: string): Promise<void>
  async markAsRead(id: string, userId: string): Promise<void>
  async notifyRecipients(announcementId: string, sendEmail: boolean): Promise<number>
  async getAnnouncementsForUser(userId: string, role: string): Promise<Announcement[]>
}
```

### NotificationService

```typescript
export class NotificationService {
  async sendNotification(userId: string, title: string, message: string, type: string): Promise<Notification>
  async getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>
  async markAsRead(id: string): Promise<Notification>
  async markAllAsRead(userId: string): Promise<number>
  async deleteNotification(id: string): Promise<void>
  async sendBulkNotification(userIds: string[], title: string, message: string): Promise<number>
  
  // Trigger notifications
  async notifyGradeSubmitted(studentId: string, assignment: string, score: number): Promise<void>
  async notifyAssignmentDue(classId: string, assignment: string, dueDate: Date): Promise<void>
  async notifyAttendanceLow(studentId: string, attendanceRate: number): Promise<void>
  async notifyAnnouncementPublished(announcementId: string): Promise<void>
}
```

### MessageService

```typescript
export class MessageService {
  async sendMessage(dto: SendMessageDto, senderId: string): Promise<Message>
  async getConversation(userId: string, page: number, limit: number): Promise<Message[]>
  async getAllConversations(userId: string, page: number, limit: number): Promise<any>
  async markMessageAsRead(id: string): Promise<Message>
  async markConversationAsRead(userId: string, participantId: string): Promise<number>
  async archiveConversation(userId: string, participantId: string): Promise<void>
  async deleteMessage(id: string, userId: string): Promise<void>
  async searchMessages(userId: string, query: string, filters?: any): Promise<Message[]>
}
```

### EmailService

```typescript
export class EmailService {
  async sendEmail(to: string, subject: string, template: string, data?: any): Promise<boolean>
  async sendBulkEmail(recipients: string[], subject: string, template: string, data?: any): Promise<number>
  async sendGradeNotification(studentEmail: string, assignmentName: string, score: number): Promise<boolean>
  async sendAnnouncementEmail(recipientEmail: string, announcement: Announcement): Promise<boolean>
  async sendAssignmentDueEmail(studentEmail: string, assignment: string, dueDate: Date): Promise<boolean>
  async sendAttendanceAlert(studentEmail: string, attendanceRate: number): Promise<boolean>
  async sendWelcomeEmail(userEmail: string, fullName: string, tempPassword: string): Promise<boolean>
}
```

---

## Data Transfer Objects (DTOs)

### CreateAnnouncementDto
```typescript
export class CreateAnnouncementDto {
  @Length(1, 200)
  title: string;

  @Length(1, 10000)
  content: string;

  @IsIn(['SCHOOL_WIDE', 'CLASS_SPECIFIC', 'PERSONAL'])
  type: string;

  @IsIn(['STUDENTS', 'FACILITATORS', 'MANAGERS', 'ALL'])
  targetAudience: string;

  @IsOptional()
  @IsUUID()
  targetClassId?: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  priority?: string;

  @IsOptional()
  @IsDateString()
  @IsNotPast()
  expiresAt?: Date;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;
}
```

### SendMessageDto
```typescript
export class SendMessageDto {
  @IsUUID()
  recipientId: string;

  @Length(1, 5000)
  content: string;

  @IsOptional()
  @IsUrl()
  attachmentUrl?: string;
}
```

---

## Notification Templates

### Grade Notification
```
Title: Grade Posted for {assignmentName}
Message: Your grade for {assignmentName} has been posted.
Score: {score}/{maxScore} ({percentage}%)
Feedback: {feedback}
```

### Assignment Due Notification
```
Title: Assignment Due Soon: {assignmentName}
Message: Assignment "{assignmentName}" is due on {dueDate}
Class: {className}
Action: Submit your assignment
```

### Announcement Notification
```
Title: {announcementTitle}
Message: {announcementContent}
Priority: {priority}
Expires: {expiresAt}
```

### Attendance Alert
```
Title: Low Attendance Warning
Message: Your attendance rate is {attendancePercentage}%
Action Required: Improve attendance to meet school requirements
```

---

## Business Logic

### Notification Routing
```
For each notification:
  1. Create in-app notification record
  2. Check user preferences:
     - Is notification type enabled?
     - Within quiet hours?
     - Frequency setting (immediate/daily/weekly)?
  3. If email enabled: Queue email
  4. If push enabled: Send push notification
  5. Log delivery status
  6. Trigger webhook (if configured)
```

### Message Status
```
SENT       → Message created, recipient notified
READ       → Recipient opened message
ARCHIVED   → User archived conversation
DELETED    → User deleted message (soft delete)
```

### Auto-trigger Notifications
```
- Grade submitted by facilitator → Student notification + Email
- Assignment published → Class students notification + Email
- Assignment due (24 hours before) → Class students notification
- Low attendance detected → Student + Parent notification
- Class announcement → Target audience notification + Email
- Assignment deadline passed → Facilitator notification
```

---

## Access Control

| Operation | Student | Facilitator | Admin |
|-----------|---------|-------------|-------|
| Create announcement | ✗ | Class-specific | ✅ |
| View announcements | ✅ | ✅ | ✅ |
| Update announcement | Creator | Creator | ✅ |
| Send message | ✅ | ✅ | ✅ |
| View own messages | ✅ | ✅ | ✅ |
| View all messages | ✗ | ✗ | ✓ (audit) |
| Update preferences | ✅ | ✅ | ✅ |

---

## Integration Points

### With Other Modules
- **Grades Module:** Trigger grade notifications
- **Assignments Module:** Trigger assignment notifications
- **Attendance Module:** Trigger attendance alerts
- **Classes Module:** Class announcements
- **Students/Facilitators:** User communication
- **Notifications Module:** Core notification engine

### Events Triggered
- `grade.submitted` → Notify student
- `assignment.published` → Notify class
- `attendance.low` → Alert student
- `announcement.created` → Notify recipients
- `message.sent` → Notify recipient

---

## Email Templates

### Welcome Email
```html
<h1>Welcome to {schoolName}</h1>
<p>Hello {fullName},</p>
<p>Your account has been created. Login details:</p>
<p>Email: {email}</p>
<p>Temporary Password: {tempPassword}</p>
<p><a href="{loginUrl}">Login Now</a></p>
```

### Grade Notification Email
```html
<h1>Grade Posted</h1>
<p>Hello {studentName},</p>
<p>Your grade for {assignmentName} has been posted:</p>
<p>Score: {score}/{maxScore} ({percentage}%)</p>
<p>Feedback: {feedback}</p>
```

---

## Error Handling

| Error Code | Status | Scenario |
|-----------|--------|----------|
| ANNOUNCEMENT_NOT_FOUND | 404 | Announcement doesn't exist |
| INVALID_TARGET_AUDIENCE | 400 | Invalid audience type |
| CLASS_REQUIRED | 400 | Class-specific missing classId |
| MESSAGE_NOT_FOUND | 404 | Message doesn't exist |
| RECIPIENT_NOT_FOUND | 404 | Recipient doesn't exist |
| INVALID_PREFERENCES | 400 | Invalid preference config |
| EMAIL_SEND_FAILED | 500 | Email delivery failed |
| INSUFFICIENT_PERMISSIONS | 403 | Cannot send to this user |

---

## Performance Considerations

### Caching
- Cache announcement list: 5 minutes
- Cache notification preferences: 1 hour
- Cache active conversations: 10 minutes

### Batch Processing
- Queue emails for batch sending (hourly)
- Batch notifications for bulk announcements
- Async email delivery

### Indexing
```sql
CREATE INDEX idx_notification_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notification_is_read ON notifications(is_read);
CREATE INDEX idx_message_sender_recipient ON messages(sender_id, recipient_id);
CREATE INDEX idx_message_created_at ON messages(created_at);
CREATE INDEX idx_announcement_type ON announcements(type);
```

---

## Summary

The Notifications & Communications feature provides:
- ✅ School-wide and class-specific announcements
- ✅ Multi-channel notifications (email, in-app, push)
- ✅ Direct messaging between users
- ✅ Notification preference management
- ✅ Delivery tracking and status
- ✅ Auto-triggered notifications for key events
- ✅ Communication history and audit trail
- ✅ Integration with all academic operations
