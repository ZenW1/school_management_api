import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { CourseStatus } from '../enum/course-status.enum';

export class CreateCourseDto {
  @ApiProperty({ description: 'The course code (must be unique)', example: 'CS101' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'The name of the course', example: 'Introduction to Computer Science' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'A detailed description of the course' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Number of credits', example: 3 })
  @IsNumber()
  @IsNotEmpty()
  credits: number;

  @ApiProperty({ required: false, description: 'Prerequisite courses' })
  @IsString()
  @IsOptional()
  prerequisites?: string;

  @ApiProperty({ required: false, description: 'URL to the course syllabus' })
  @IsString()
  @IsOptional()
  syllabusUrl?: string;

  @ApiProperty({ enum: CourseStatus, required: false, description: 'The status of the course' })
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;
}
