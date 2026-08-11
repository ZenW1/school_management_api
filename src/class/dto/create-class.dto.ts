import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsObject, IsDateString } from 'class-validator';
import { ClassStatus } from '../enum/class-status.enum';

export class CreateClassDto {
  @ApiProperty({ description: 'The ID of the related Course', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @ApiProperty({ required: false, description: 'The ID of the assigned Facilitator', example: 1 })
  @IsNumber()
  @IsOptional()
  facilitatorId?: number;

  @ApiProperty({ description: 'The name of the class', example: 'CS101 - Fall A' })
  @IsString()
  @IsNotEmpty()
  className: string;

  @ApiProperty({ description: 'The maximum student capacity', example: 30 })
  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @ApiProperty({ 
    description: 'Schedule in JSON format', 
    example: { day: 'Monday', startTime: '10:00', endTime: '12:00', room: 'A101' } 
  })
  @IsObject()
  @IsNotEmpty()
  schedule: Record<string, any>;

  @ApiProperty({ description: 'Semester identifier', example: 'Fall 2026' })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ description: 'The start date of the class', example: '2026-09-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'The end date of the class', example: '2026-12-15' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ enum: ClassStatus, required: false, description: 'The status of the class' })
  @IsEnum(ClassStatus)
  @IsOptional()
  status?: ClassStatus;
}
