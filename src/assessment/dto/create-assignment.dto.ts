import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Length, Min, Max, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'The ID of the Class', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  classId: number;

  @ApiProperty({ example: 'Midterm Essay' })
  @IsString()
  @Length(1, 200)
  title: string;

  @ApiProperty({ example: 'Write a 1000 word essay on...' })
  @IsString()
  @Length(10, 5000)
  description: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxScore: number;

  @ApiProperty({ required: false, default: 1.0, description: 'Weight multiplier (0.5 to 2.0)' })
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: 'Due date in ISO format' })
  @IsDateString()
  dueDate: Date;

  @ApiProperty({ required: false, description: 'Markdown instructions' })
  @IsString()
  @IsOptional()
  instructions?: string;
}
