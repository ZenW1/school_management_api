import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { CreateClassDto } from './create-class.dto';

export class UpdateClassDto extends PartialType(
  OmitType(CreateClassDto, ['courseId', 'semester', 'startDate', 'endDate'] as const)
) {}
