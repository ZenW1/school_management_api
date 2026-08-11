import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateFacilitatorDto } from './create-facilitator.dto';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFacilitatorDto extends PartialType(
  OmitType(CreateFacilitatorDto, ['email', 'password', 'hireDate'] as const),
) {
  @ApiProperty({ required: false })
  @IsOptional()
  availability?: object;
}
