import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(
  OmitType(CreateCourseDto, ['code'] as const)
) {}
