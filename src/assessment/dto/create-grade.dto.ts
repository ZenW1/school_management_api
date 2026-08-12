import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateGradeDto {
  @ApiProperty({ description: 'The ID of the Student', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  studentId: number;

  @ApiProperty({ required: false, description: 'The ID of the Assignment', example: 1 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  assignmentId?: number;

  @ApiProperty({ required: false, description: 'The ID of the Class', example: 1 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  classId?: number;

  @ApiProperty({ example: 85.5 })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({ required: false, description: 'Weight multiplier override', example: 1.0 })
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  @IsOptional()
  weight?: number;

  @ApiProperty({ required: false, description: 'Markdown feedback' })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  rubricScores?: Record<string, number>;
}
