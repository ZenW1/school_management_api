import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { StudentStatus } from '../enum/student.status.enum';

export class CreateStudentDto {
  @ApiProperty({ description: 'The user ID associated with the student' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'The name of the student' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The enrollment date of the student', example: '2023-09-01' })
  @IsDateString()
  @IsNotEmpty()
  enrollmentDate: string;

  @ApiProperty({ description: 'The name of the parent/guardian' })
  @IsString()
  @IsNotEmpty()
  parentName: string;

  @ApiProperty({ description: 'The phone number of the parent/guardian' })
  @IsString()
  @IsNotEmpty()
  parentPhone: string;

  @ApiProperty({ description: 'The address of the student' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'The date of birth of the student', example: '2010-05-15' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ description: 'The GPA of the student', minimum: 0, maximum: 4.0 })
  @IsNumber()
  @Min(0)
  @Max(4.0)
  @IsNotEmpty()
  gpa: number;

  @ApiProperty({ enum: StudentStatus, required: false, description: 'The status of the student' })
  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;
}