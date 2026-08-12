import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAssignmentDto } from './create-assignment.dto';

export class UpdateAssignmentDto extends PartialType(
  OmitType(CreateAssignmentDto, ['classId'] as const)
) {}
