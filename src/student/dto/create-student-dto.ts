import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
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
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email for the student login',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'securepassword123',
    description: 'Password for the student login',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'The name of the student' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The enrollment date of the student', example: '2023-09-01' })
  @IsDateString()
  @IsNotEmpty()
  enrollmentDate: string;

  @ApiProperty({ description: 'The name of the parent/guardian', required: false })
  @IsString()
  @IsOptional()
  parentName?: string;

  @ApiProperty({ description: 'The phone number of the parent/guardian', required: false })
  @IsString()
  @IsOptional()
  parentPhone?: string;

  @ApiProperty({ description: 'The address of the student', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'The date of birth of the student', example: '2010-05-15', required: false })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;


  @ApiProperty({ enum: StudentStatus, required: false, description: 'The status of the student' })
  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;
}