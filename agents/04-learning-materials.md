# 4. Learning Materials Management Feature

## Overview
The Learning Materials Management feature enables facilitators to upload, organize, and share course materials with students. Supports PDFs, videos, documents, and images with flexible organization by course, topic, or week.

---

## Feature Scope

### Core Responsibilities
- Material upload and storage (S3/local)
- Material categorization by course/topic/week
- Access control and visibility management
- Search and filtering capabilities
- Material versioning (optional)
- Download tracking
- Storage quota management

### Key Entities

#### LearningMaterial Entity
```typescript
@Entity('learning_materials')
export class LearningMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Course, { eager: true })
  @JoinColumn()
  course: Course;

  @ManyToOne(() => Class, { nullable: true })
  @JoinColumn()
  class?: Class;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  fileUrl: string;  // S3 URL or local path

  @Column()
  fileName: string;

  @Column({ type: 'int' })
  fileSizeBytes: number;

  @Column()
  fileType: 'PDF' | 'VIDEO' | 'DOCUMENT' | 'IMAGE' | 'AUDIO' | 'OTHER';

  @Column({ nullable: true })
  week?: number;

  @Column({ nullable: true })
  topic?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @Column({
    type: 'enum',
    enum: ['PUBLIC', 'PRIVATE', 'RESTRICTED'],
    default: 'PRIVATE'
  })
  visibility: string;

  @Column({ type: 'int', default: 0 })
  downloadCount: number;

  @CreateDateColumn()
  uploadDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'text', nullable: true })
  tags: string;  // Comma-separated tags

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;  // Highlight important materials
}
```

---

## API Endpoints

### 1. Upload Learning Material
**Endpoint:** `POST /materials/upload`

**Description:** Upload new learning material (facilitator/admin only)

**Request:** Multipart form-data

**Form Fields:**
```typescript
{
  courseId: string;          // Required
  classId?: string;          // Optional: link to specific class
  title: string;             // Required, 1-200 chars
  description?: string;      // Optional, markdown supported
  week?: number;             // Optional: week number
  topic?: string;            // Optional: topic/chapter name
  visibility: string;        // PUBLIC, PRIVATE, RESTRICTED
  tags?: string;             // Comma-separated tags
  file: File;                // The actual file (multipart)
}
```

**Validation Rules:**
- File size: 1MB - 2GB (configurable)
- Allowed types: PDF, DOCX, PPTX, MP4, MOV, PNG, JPG, MP3, etc.
- Title required and non-empty
- Course must exist
- Only facilitator of course or admin can upload
- Storage quota not exceeded

**Response:**
```typescript
{
  id: string;
  title: string;
  fileType: string;
  fileSizeBytes: number;
  courseId: string;
  visibility: string;
  uploadDate: Date;
  downloadUrl: string;
  uploadedBy: {
    id: string;
    fullName: string;
  };
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Invalid file or metadata
- `413 Payload Too Large` - File exceeds size limit
- `507 Insufficient Storage` - Quota exceeded

---

### 2. List Materials
**Endpoint:** `GET /materials`

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  courseId?: string;
  classId?: string;
  week?: number;
  topic?: string;
  fileType?: string;         // PDF, VIDEO, DOCUMENT, etc.
  visibility?: string;
  search?: string;           // Search title/description
  tags?: string;             // Filter by tags
  sortBy?: string;           // uploadDate, title, downloadCount
  sortOrder?: 'ASC' | 'DESC';
}
```

**Response:**
```typescript
{
  data: LearningMaterial[];
  total: number;
  page: number;
  limit: number;
  stats: {
    totalMaterials: number;
    totalSizeBytes: number;
    byType: { PDF: number; VIDEO: number; ... };
  };
}
```

---

### 3. Get Material Details
**Endpoint:** `GET /materials/:id`

**Response:**
```typescript
{
  id: string;
  title: string;
  description?: string;
  fileType: string;
  fileSizeBytes: number;
  course: {
    id: string;
    name: string;
    code: string;
  };
  class?: {
    id: string;
    className: string;
  };
  week?: number;
  topic?: string;
  visibility: string;
  downloadCount: number;
  uploadedBy: {
    id: string;
    fullName: string;
    email: string;
  };
  uploadDate: Date;
  updatedAt: Date;
  tags: string[];
  isFeatured: boolean;
  downloadUrl: string;
  relatedMaterials: LearningMaterial[];
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Material not found
- `403 Forbidden` - Cannot access (private/restricted)

---

### 4. Update Material Metadata
**Endpoint:** `PATCH /materials/:id`

**Request Body:**
```typescript
{
  title?: string;
  description?: string;
  week?: number;
  topic?: string;
  visibility?: string;
  tags?: string;
  isFeatured?: boolean;
}
```

**Note:** Cannot change file itself, topic, or course after upload

**Response:** Updated material object

**Status Codes:**
- `200 OK` - Success
- `403 Forbidden` - Cannot edit (not uploader or admin)
- `404 Not Found` - Material not found

---

### 5. Download Material
**Endpoint:** `GET /materials/:id/download`

**Description:** Download file and increment download counter

**Query Parameters:**
```typescript
{
  token?: string;  // Pre-signed URL token (optional)
}
```

**Response:** 
- HTTP 302 Redirect to S3 signed URL or file stream
- Increment downloadCount
- Log download for analytics

**Status Codes:**
- `302 Found` - Redirect to file
- `403 Forbidden` - Cannot access
- `404 Not Found` - Material not found

---

### 6. Get Material Preview
**Endpoint:** `GET /materials/:id/preview`

**Description:** Get preview/thumbnail for materials

**Query Parameters:**
```typescript
{
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';  // Default: MEDIUM
}
```

**Response:**
```typescript
{
  materialId: string;
  title: string;
  preview: string;  // URL to thumbnail/preview image
  pages?: number;   // For PDFs
  duration?: number; // For videos (seconds)
}
```

---

### 7. Delete Material
**Endpoint:** `DELETE /materials/:id`

**Business Rules:**
- Only uploader or admin can delete
- File is deleted from storage (S3)
- Deletion is logged for audit
- Download history may be preserved

**Status Codes:**
- `204 No Content` - Success
- `403 Forbidden` - Cannot delete
- `404 Not Found` - Material not found

---

### 8. Get Course Materials
**Endpoint:** `GET /courses/:courseId/materials`

**Query Parameters:**
```typescript
{
  groupBy?: 'WEEK' | 'TOPIC' | 'TYPE' | 'NONE';  // Default: WEEK
  week?: number;
  topic?: string;
}
```

**Response:**
```typescript
{
  course: {
    id: string;
    name: string;
  };
  materials: LearningMaterial[];
  grouped: {
    byWeek?: { [week: number]: LearningMaterial[] };
    byTopic?: { [topic: string]: LearningMaterial[] };
    byType?: { [type: string]: LearningMaterial[] };
  };
  stats: {
    totalMaterials: number;
    totalSize: string;
    lastUpdated: Date;
  };
}
```

---

### 9. Search Materials
**Endpoint:** `GET /materials/search`

**Query Parameters:**
```typescript
{
  q: string;                 // Search query
  in?: 'TITLE' | 'DESCRIPTION' | 'ALL';  // Default: ALL
  courseId?: string;
  fileType?: string;
  limit?: number;            // Default: 20
}
```

**Response:**
```typescript
{
  results: LearningMaterial[];
  total: number;
  query: string;
  searchTime: number;  // milliseconds
}
```

---

### 10. Get Material Statistics
**Endpoint:** `GET /materials/statistics`

**Query Parameters:**
```typescript
{
  courseId?: string;
  from?: Date;
  to?: Date;
}
```

**Response:**
```typescript
{
  totalMaterials: number;
  totalDownloads: number;
  totalStorageUsed: string;
  byType: {
    PDF: { count: number; size: string; downloads: number; };
    VIDEO: { count: number; size: string; downloads: number; };
    // ... other types
  };
  topMaterials: [
    {
      id: string;
      title: string;
      downloads: number;
    }
  ];
  trends: {
    uploadsPerWeek: number[];
    downloadsPerWeek: number[];
  };
}
```

---

### 11. Bulk Update Materials
**Endpoint:** `PATCH /materials/bulk`

**Request Body:**
```typescript
{
  materialIds: string[];
  updates: {
    visibility?: string;
    topic?: string;
    tags?: string;
    isFeatured?: boolean;
  };
}
```

**Response:**
```typescript
{
  updated: number;
  failed: number;
  errors?: any[];
}
```

---

### 12. Get Featured Materials
**Endpoint:** `GET /materials/featured`

**Query Parameters:**
```typescript
{
  courseId?: string;
  limit?: number;  // Default: 10
}
```

**Response:**
```typescript
{
  materials: LearningMaterial[];  // Only isFeatured: true
}
```

---

## Data Transfer Objects (DTOs)

### UploadMaterialDto
```typescript
export class UploadMaterialDto {
  @IsUUID()
  courseId: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @Length(1, 200)
  title: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @Min(1)
  @Max(52)
  week?: number;

  @IsOptional()
  topic?: string;

  @IsIn(['PUBLIC', 'PRIVATE', 'RESTRICTED'])
  visibility: string;

  @IsOptional()
  tags?: string;
}
```

### UpdateMaterialDto
```typescript
export class UpdateMaterialDto {
  @IsOptional()
  @Length(1, 200)
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @Min(1)
  @Max(52)
  week?: number;

  @IsOptional()
  topic?: string;

  @IsOptional()
  @IsIn(['PUBLIC', 'PRIVATE', 'RESTRICTED'])
  visibility?: string;

  @IsOptional()
  tags?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
```

---

## Service Methods

### LearningMaterialsService

```typescript
export class LearningMaterialsService {
  constructor(
    @InjectRepository(LearningMaterial) private materialRepo: Repository<LearningMaterial>,
    private fileService: FileService,
    private s3Service: S3Service,
  ) {}

  async uploadMaterial(dto: UploadMaterialDto, file: Express.Multer.File): Promise<LearningMaterial>
  async findAll(page: number, limit: number, filters: any): Promise<{ data: LearningMaterial[]; total: number; }>
  async findById(id: string): Promise<LearningMaterial>
  async updateMaterial(id: string, dto: UpdateMaterialDto): Promise<LearningMaterial>
  async deleteMaterial(id: string): Promise<void>
  async downloadMaterial(id: string): Promise<{ url: string; }>
  async getPreview(id: string, size?: string): Promise<string>
  async getCoursesMaterials(courseId: string, groupBy?: string): Promise<any>
  async searchMaterials(query: string, filters?: any): Promise<LearningMaterial[]>
  async getStatistics(courseId?: string, from?: Date, to?: Date): Promise<any>
  async bulkUpdateMaterials(materialIds: string[], updates: any): Promise<any>
  async getFeaturedMaterials(courseId?: string, limit?: number): Promise<LearningMaterial[]>
  async incrementDownloadCount(id: string): Promise<void>
  async generateSignedUrl(id: string, expiresIn?: number): Promise<string>
  async checkStorageQuota(courseId: string): Promise<boolean>
}
```

### FileService
```typescript
export class FileService {
  async uploadToS3(file: Express.Multer.File, key: string): Promise<string>
  async deleteFromS3(key: string): Promise<void>
  async generateSignedUrl(key: string, expiresIn: number): Promise<string>
  async getFileSize(file: Express.Multer.File): Promise<number>
  async validateFileType(file: Express.Multer.File): Promise<boolean>
  async generateThumbnail(file: Express.Multer.File): Promise<Buffer>
}
```

---

## Business Logic

### File Upload Workflow
1. User selects file and fills metadata
2. System validates file:
   - Size check (1MB - 2GB)
   - Type check (whitelist)
   - Virus scan (optional, third-party)
3. Check storage quota for course
4. Upload to S3 with unique key
5. Create database record
6. Generate thumbnail/preview
7. Return signed download URL

### Access Control Logic
```
For each material access request:
  If visibility == PUBLIC:
    Allow access
  Else if visibility == PRIVATE:
    If user == uploader OR user == admin:
      Allow access
    Else:
      Deny access
  Else if visibility == RESTRICTED:
    If user is enrolled in class AND material.class == user.classes:
      Allow access
    Else:
      Deny access
```

### Storage Quota
```
Default quota: 10GB per course
- Warn at 80% usage
- Block uploads at 95% usage
- Admin can increase quota
- Soft delete (reclaim): Remove old material
```

---

## Validation Rules

### File Types Allowed
```
Documents:    PDF, DOCX, XLSX, PPTX, TXT, MD
Videos:       MP4, MOV, AVI, MKV, WebM
Audio:        MP3, WAV, M4A, AAC
Images:       PNG, JPG, JPEG, GIF, WebP
Archives:     ZIP, RAR, 7Z (max 100MB)
```

### File Size Limits
```
Documents:    500MB
Videos:       1GB
Audio:        100MB
Images:       50MB
Archives:     100MB
Total course: 10GB (configurable)
```

### Metadata Validation
- Title: 1-200 characters, non-empty
- Description: 0-5000 characters
- Week: 1-52 (optional)
- Topic: 1-100 characters (optional)
- Tags: max 10, each 1-30 chars

---

## Access Control

| Operation | Student | Facilitator | Manager | Admin |
|-----------|---------|-------------|---------|-------|
| Upload | ✗ | ✅ | ✗ | ✅ |
| View (public) | ✅ | ✅ | ✅ | ✅ |
| View (private) | ✗ | ✅ | ✅ | ✅ |
| View (restricted) | ✅ | ✅ | ✅ | ✅ |
| Update | Uploader | ✅ | ✗ | ✅ |
| Delete | Uploader | ✅ | ✗ | ✅ |
| Download | Permitted | ✅ | ✅ | ✅ |

---

## Integration Points

### With Other Modules
- **Courses Module:** Materials linked to courses
- **Classes Module:** Materials can be class-specific
- **Enrollment Module:** Access based on enrollment
- **Notifications Module:** New material alerts

### Events Triggered
- `material.uploaded` → Notify enrolled students
- `material.deleted` → Notify if used in assignments
- `material.quota-warning` → Notify admin

---

## Error Handling

| Error Code | Status | Scenario |
|-----------|--------|----------|
| FILE_TOO_LARGE | 413 | File exceeds size limit |
| INVALID_FILE_TYPE | 400 | File type not allowed |
| QUOTA_EXCEEDED | 507 | Storage quota full |
| MATERIAL_NOT_FOUND | 404 | Material ID doesn't exist |
| ACCESS_DENIED | 403 | User cannot access material |
| UPLOAD_FAILED | 500 | Server error during upload |
| INVALID_METADATA | 400 | Invalid title, topic, etc. |

---

## Performance Considerations

### Indexing
```sql
CREATE INDEX idx_material_course_id ON learning_materials(course_id);
CREATE INDEX idx_material_class_id ON learning_materials(class_id);
CREATE INDEX idx_material_visibility ON learning_materials(visibility);
CREATE INDEX idx_material_upload_date ON learning_materials(upload_date);
CREATE INDEX idx_material_file_type ON learning_materials(file_type);
CREATE INDEX idx_material_week ON learning_materials(week);
CREATE INDEX idx_material_topic ON learning_materials(topic);
```

### Caching
- Cache featured materials: 1 hour
- Cache course material list: 30 minutes
- Cache file signed URLs: 10 minutes
- Cache statistics: 1 hour

### Optimization
- Use CDN for file delivery
- Lazy load material previews
- Compress images on upload
- Transcode videos (optional)
- Use paginated lists

---

## Summary

The Learning Materials Management feature provides:
- ✅ Flexible file upload and storage
- ✅ Comprehensive organization by course/topic/week
- ✅ Access control (public/private/restricted)
- ✅ Search and discovery
- ✅ Download analytics
- ✅ Storage quota management
- ✅ Integration with academic workflow
