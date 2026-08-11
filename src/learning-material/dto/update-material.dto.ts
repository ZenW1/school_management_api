import { PartialType, OmitType } from '@nestjs/swagger';
import { UploadMaterialDto } from './upload-material.dto';

// Omit courseId, classId, and topic since they shouldn't change after upload
export class UpdateMaterialDto extends PartialType(
  OmitType(UploadMaterialDto, ['courseId', 'classId', 'topic'] as const)
) {}
