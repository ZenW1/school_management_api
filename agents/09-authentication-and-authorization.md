# 9. Authentication & Authorization (Core Security)

## Overview
The Authentication & Authorization system is the foundation of API security. It handles user login/registration, JWT token management, role-based access control (RBAC), and permission enforcement across all endpoints.

---

## Feature Scope

### Core Responsibilities
- User registration and account creation
- Login with email and password
- JWT token generation and refresh
- Password reset and recovery
- Session management
- Role-based access control (RBAC)
- Permission enforcement
- Password policies and validation
- Account security (2FA optional)
- Audit logging for security events

---

## Key Entities

### User Entity
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column()
  phone: string;

  @Column({ select: false })
  password: string;  // Hashed with bcrypt

  @Column({
    type: 'enum',
    enum: ['STUDENT', 'FACILITATOR', 'MANAGER', 'ADMIN'],
  })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  lastLogin?: Date;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'boolean', default: false })
  isLocked: boolean;  // After N failed attempts

  @Column({ nullable: true })
  lockedUntil?: Date;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true })
  twoFactorSecret?: string;

  @OneToMany(() => RefreshToken, token => token.user)
  refreshTokens: RefreshToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Role Entity
```typescript
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;  // STUDENT, FACILITATOR, MANAGER, ADMIN

  @Column({ type: 'text' })
  description: string;

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' }
  })
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;
}
```

### Permission Entity
```typescript
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;  // e.g., "CREATE_ANNOUNCEMENT", "VIEW_GRADES"

  @Column()
  resource: string;  // e.g., "announcements", "grades"

  @Column()
  action: string;    // e.g., "create", "view", "delete"

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;
}
```

### RefreshToken Entity
```typescript
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column()
  token: string;  // Hashed refresh token

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  revokedAt?: Date;  // Soft delete

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## API Endpoints

### 1. Register New User
**Endpoint:** `POST /auth/register`

**Request Body:**
```typescript
{
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role?: string;  // STUDENT (default), FACILITATOR, MANAGER, ADMIN
}
```

**Validation Rules:**
- Email must be unique and valid email format
- Password must be 8+ chars with uppercase, lowercase, number, special char
- Full name 2-100 characters
- Phone must be valid format (10-15 digits)
- Role assignment restricted by permissions

**Response:**
```typescript
{
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  emailVerified: false;
  message: string;  // Check your email for verification link
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Validation error
- `409 Conflict` - Email already exists

---

### 2. Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```typescript
{
  email: string;
  password: string;
  rememberMe?: boolean;  // Extend token expiry
}
```

**Business Rules:**
- Case-insensitive email check
- Compare password hash
- Track failed attempts
- Lock account after 5 failed attempts (30 min lock)
- Update lastLogin timestamp
- Generate JWT and refresh token

**Response:**
```typescript
{
  accessToken: string;           // JWT valid for 1 hour
  refreshToken: string;          // Valid for 30 days
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    permissions: string[];  // Flattened permissions
  };
  expiresIn: 3600;  // Seconds
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Invalid credentials
- `423 Locked` - Account locked (too many failed attempts)

---

### 3. Refresh Access Token
**Endpoint:** `POST /auth/refresh-token`

**Request Body:**
```typescript
{
  refreshToken: string;
}
```

**Business Rules:**
- Validate refresh token exists and not expired
- Check if revoked
- Generate new access token
- Optionally rotate refresh token

**Response:**
```typescript
{
  accessToken: string;
  refreshToken?: string;  // If rotated
  expiresIn: 3600;
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Invalid or expired refresh token
- `400 Bad Request` - Missing refresh token

---

### 4. Logout
**Endpoint:** `POST /auth/logout`

**Authentication:** Required (Bearer token)

**Business Rules:**
- Invalidate all refresh tokens for user (or just this session)
- Clear session
- Log logout event

**Response:**
```typescript
{
  message: string;
}
```

---

### 5. Forgot Password
**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```typescript
{
  email: string;
}
```

**Business Rules:**
- Generate secure reset token (crypto.randomBytes)
- Store token hash in database with expiry (1 hour)
- Send email with reset link
- Don't reveal if email exists (security)

**Response:**
```typescript
{
  message: string;  // Check your email for password reset link
}
```

**Status Codes:**
- `200 OK` - Success (regardless if email exists)

---

### 6. Reset Password
**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```typescript
{
  token: string;
  newPassword: string;
  confirmPassword: string;
}
```

**Validation Rules:**
- Token must be valid and not expired
- New password must meet requirements
- Passwords must match
- Cannot reuse last 5 passwords (optional)

**Response:**
```typescript
{
  message: string;
  loginUrl: string;
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid token or weak password
- `410 Gone` - Token expired

---

### 7. Change Password
**Endpoint:** `PATCH /auth/change-password`

**Authentication:** Required

**Request Body:**
```typescript
{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

**Validation Rules:**
- Current password must be correct
- New password must be different
- Must meet complexity requirements

**Response:**
```typescript
{
  message: string;
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Current password incorrect
- `400 Bad Request` - Weak password

---

### 8. Verify Email
**Endpoint:** `POST /auth/verify-email`

**Request Body:**
```typescript
{
  token: string;  // From email link
}
```

**Business Rules:**
- Token valid for 24 hours
- Mark user emailVerified: true
- Automatically send after registration

**Response:**
```typescript
{
  message: string;
  redirectUrl: string;  // To login page
}
```

---

### 9. Resend Verification Email
**Endpoint:** `POST /auth/resend-verification`

**Request Body:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  message: string;
}
```

---

### 10. Get Current User
**Endpoint:** `GET /auth/me`

**Authentication:** Required

**Response:**
```typescript
{
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastLogin: Date;
  createdAt: Date;
}
```

---

### 11. Update Profile
**Endpoint:** `PATCH /auth/profile`

**Authentication:** Required

**Request Body:**
```typescript
{
  fullName?: string;
  phone?: string;
  // Email and password changed via separate endpoints
}
```

**Response:** Updated user object

---

### 12. Setup 2FA
**Endpoint:** `POST /auth/2fa/setup`

**Authentication:** Required

**Response:**
```typescript
{
  qrCode: string;  // QR code data URI
  secret: string;  // Backup secret
  message: string;
}
```

---

### 13. Verify 2FA
**Endpoint:** `POST /auth/2fa/verify`

**Request Body:**
```typescript
{
  code: string;  // 6-digit code from authenticator
}
```

**Response:**
```typescript
{
  twoFactorEnabled: true;
  backupCodes: string[];
}
```

---

### 14. Get All Sessions
**Endpoint:** `GET /auth/sessions`

**Authentication:** Required

**Response:**
```typescript
{
  sessions: [
    {
      id: string;
      ipAddress: string;
      userAgent: string;
      createdAt: Date;
      lastActive: Date;
      isCurrent: boolean;
    }
  ];
}
```

---

### 15. Revoke Session
**Endpoint:** `DELETE /auth/sessions/:sessionId`

**Response:**
- `204 No Content` - Success

---

## Data Transfer Objects (DTOs)

### RegisterDto
```typescript
export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  password: string;

  @Length(2, 100)
  fullName: string;

  @Matches(/^\+?[1-9]\d{1,14}$/)
  phone: string;

  @IsOptional()
  @IsIn(['STUDENT', 'FACILITATOR', 'MANAGER', 'ADMIN'])
  role?: string;
}
```

### LoginDto
```typescript
export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
```

### ChangePasswordDto
```typescript
export class ChangePasswordDto {
  @IsNotEmpty()
  currentPassword: string;

  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  newPassword: string;

  @IsNotEmpty()
  confirmPassword: string;
}
```

---

## Service Methods

### AuthService

```typescript
export class AuthService {
  async register(dto: RegisterDto): Promise<{ user: User; confirmationSent: boolean; }>
  async login(dto: LoginDto, ipAddress: string, userAgent: string): Promise<{ accessToken: string; refreshToken: string; user: any; }>
  async refreshToken(token: string, ipAddress: string): Promise<{ accessToken: string; refreshToken?: string; }>
  async logout(userId: string, refreshToken?: string): Promise<void>
  async forgotPassword(email: string): Promise<boolean>
  async resetPassword(token: string, newPassword: string): Promise<boolean>
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>
  async verifyEmail(token: string): Promise<void>
  async resendVerificationEmail(email: string): Promise<void>
  async getCurrentUser(userId: string): Promise<User>
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User>
  async setup2FA(userId: string): Promise<{ qrCode: string; secret: string; }>
  async verify2FA(userId: string, code: string): Promise<{ backupCodes: string[]; }>
  async getSessions(userId: string): Promise<RefreshToken[]>
  async revokeSession(userId: string, sessionId: string): Promise<void>
}
```

### JwtService
```typescript
export class JwtService {
  generateAccessToken(userId: string, role: string): string
  generateRefreshToken(userId: string): string
  verifyAccessToken(token: string): JwtPayload
  verifyRefreshToken(token: string): JwtPayload
  decodeToken(token: string): any
}
```

### PermissionService
```typescript
export class PermissionService {
  async getPermissionsForRole(role: string): Promise<Permission[]>
  async getPermissionsForUser(userId: string): Promise<Permission[]>
  async canUserAccess(userId: string, resource: string, action: string): Promise<boolean>
  async createPermission(name: string, resource: string, action: string): Promise<Permission>
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void>
  async revokePermissionFromRole(roleId: string, permissionId: string): Promise<void>
}
```

---

## JWT Structure

### Access Token Payload
```typescript
{
  sub: string;       // User ID
  email: string;
  role: string;
  permissions: string[];
  iat: number;       // Issued at
  exp: number;       // Expiration (1 hour)
  iss: string;       // Issuer
  aud: string;       // Audience
}
```

### Refresh Token Payload
```typescript
{
  sub: string;       // User ID
  type: 'refresh';
  iat: number;
  exp: number;       // Expiration (30 days)
  jti: string;       // JWT ID (unique)
}
```

---

## Role-Based Access Control (RBAC)

### Roles

#### STUDENT
- View own profile
- View enrolled courses
- Submit assignments
- View own grades
- View own attendance
- Send messages to facilitators
- View announcements
- Download materials

#### FACILITATOR
- View own profile
- Manage assigned classes
- Create/publish assignments
- Grade submissions
- Mark attendance
- Upload learning materials
- View class performance
- Send announcements (class-specific)
- Send messages to students

#### MANAGER
- View all student/facilitator data
- Create users
- View class/course reports
- Generate analytics
- Manage enrollment
- Send school-wide announcements
- View attendance analytics

#### ADMIN
- Full system access
- Manage users and roles
- Configure system settings
- View audit logs
- Manage permissions
- System maintenance

### Permission Matrix

```
Resource: students
- CREATE   → Manager, Admin
- READ     → Own data (Student), Manager, Admin
- UPDATE   → Own data (Student), Manager, Admin
- DELETE   → Admin

Resource: classes
- CREATE   → Manager, Admin
- READ     → Enrolled (Student), Assigned (Facilitator), Manager, Admin
- UPDATE   → Facilitator (own), Manager, Admin
- DELETE   → Admin

Resource: grades
- CREATE   → Assigned Facilitator, Admin
- READ     → Student (own), Facilitator (class), Manager, Admin
- UPDATE   → Facilitator (own), Admin
- DELETE   → Admin

Resource: announcements
- CREATE   → Facilitator (class), Manager, Admin
- READ     → All authenticated
- UPDATE   → Creator, Admin
- DELETE   → Creator, Admin
```

---

## Security Best Practices

### Password Policy
```
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character (@$!%*?&)
- No password reuse (last 5 passwords)
- Expires every 90 days (optional)
```

### Token Security
```
- Access tokens: 1 hour expiry
- Refresh tokens: 30 days expiry
- Tokens stored in httpOnly cookies (not localStorage)
- Refresh token rotation on every use
- Token revocation on logout
- Secure, SameSite, HttpOnly cookie flags
```

### Account Security
```
- Account lockout after 5 failed attempts (30 min)
- IP address tracking for sessions
- Email verification before full access
- 2FA support (optional)
- Session management and revocation
- Audit logging for all security events
```

### Data Protection
```
- Passwords hashed with bcrypt (10 rounds)
- Refresh tokens stored as hashes
- Reset tokens expire in 1 hour
- Sensitive data not returned in responses
- CORS enabled for trusted origins only
- Rate limiting on auth endpoints
```

---

## Guards and Decorators

### JwtAuthGuard
```typescript
// Checks if JWT token is valid
@UseGuards(JwtAuthGuard)
@Get('/protected-route')
getProtected() { }
```

### RoleGuard
```typescript
// Checks if user has required role
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('ADMIN', 'MANAGER')
@Get('/admin-route')
getAdmin() { }
```

### PermissionGuard
```typescript
// Checks if user has required permission
@UseGuards(JwtAuthGuard, PermissionGuard)
@Permissions('VIEW_GRADES', 'EDIT_GRADES')
@Patch('/grades/:id')
updateGrade() { }
```

### Public Decorator
```typescript
// Skip authentication for public routes
@Public()
@Post('/auth/login')
login() { }
```

---

## Error Handling

| Error Code | Status | Scenario |
|-----------|--------|----------|
| INVALID_CREDENTIALS | 401 | Wrong email/password |
| ACCOUNT_LOCKED | 423 | Too many failed attempts |
| EMAIL_NOT_VERIFIED | 403 | Email not verified |
| INVALID_TOKEN | 401 | Invalid/expired token |
| TOKEN_EXPIRED | 401 | Access token expired |
| INSUFFICIENT_PERMISSIONS | 403 | Lacks required permission |
| WEAK_PASSWORD | 400 | Password doesn't meet requirements |
| EMAIL_ALREADY_EXISTS | 409 | Duplicate email |

---

## Integration Points

### With Other Modules
- **User Module:** Creation and updates
- **Students Module:** Student account creation
- **Facilitators Module:** Facilitator account creation
- **All Modules:** Access control enforcement

### Events Triggered
- `user.registered` → Send verification email
- `user.login` → Update lastLogin, log event
- `user.logout` → Invalidate tokens
- `password.changed` → Log security event
- `permission.changed` → Invalidate cached permissions

---

## Audit Logging

### Security Events Logged
- User registration
- Login (success/failure)
- Password changes
- Token refresh
- Permission changes
- Account lockout
- Session revocation
- 2FA setup/changes
- Email verification

---

## Summary

The Authentication & Authorization feature provides:
- ✅ Secure user registration and login
- ✅ JWT-based token management
- ✅ Refresh token rotation
- ✅ Password reset and recovery
- ✅ Role-based access control
- ✅ Fine-grained permission system
- ✅ Account security (lockout, 2FA)
- ✅ Session management
- ✅ Comprehensive audit logging
- ✅ Security best practices implementation
