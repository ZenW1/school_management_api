# Learning Materials Management (Phase 1.7)

## Overview
The Learning Materials module provides the foundation for uploading, managing, and downloading academic resources. Materials are strictly tied to a `Course`, and optionally tied to a specific `Class` and `Week`.

## Entity Architecture
- **Primary Key:** Auto-incrementing Integer (Consistency with `User`, `Course`, `Class`).
- **Relationships:**
  - `ManyToOne` -> `Course` (Eagerly loaded).
  - `ManyToOne` -> `Class` (Nullable).
  - `ManyToOne` -> `User` (Tracks `uploadedBy`).
- **Enums:**
  - `FileType`: Categorizes the material (`PDF`, `VIDEO`, `DOCUMENT`, `IMAGE`, `AUDIO`, `OTHER`).
  - `Visibility`: Controls access levels (`PUBLIC`, `PRIVATE`, `RESTRICTED`).

## DTOs & Validation
- **`UploadMaterialDto`**: Enforces strict validation on incoming multipart form-data.
- **`UpdateMaterialDto`**: Employs `PartialType(OmitType(...))` to ensure that core metadata (`courseId`, `classId`, `topic`) cannot be mutated after the file is initially uploaded.

## Endpoints & File Upload Mock
Because AWS S3 is not yet configured for the prototype, file uploads are currently intercepted using `Multer` (`FileInterceptor`), but the upload process is mocked in the `LearningMaterialService`.
- **`POST /materials/upload`**: Accepts `multipart/form-data`, mocks an S3 upload, and persists the entity with a fake `fileUrl`, along with real file size and MIME type parsing.
- **`GET /materials/:id/download`**: Increments the `downloadCount` of the material and returns the mock URL for the client to download.
- **Access Control**: Upload, Update, and Delete endpoints are restricted to `@Roles(Role.ADMIN, Role.FACILITATOR)`.

## Future Work (Phase 2+)
- Replace the mock S3 URL generation in `LearningMaterialService` with a real AWS S3 `PutObjectCommand`.
- Implement signed URLs for downloading private/restricted materials.
- Implement fine-grained filtering in `GET /materials` to enforce `Visibility` rules based on the requesting user's enrollment status.
