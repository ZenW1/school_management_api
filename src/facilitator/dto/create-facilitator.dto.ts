import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  Length,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFacilitatorDto {
  @ApiProperty({ description: 'The email of the facilitator' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password of the facilitator (min 8 chars, 1 uppercase, 1 lowercase, 1 number)' })
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password: string;

  @ApiProperty({ description: 'The full name of the facilitator' })
  @IsString()
  @Length(2, 100)
  fullName: string;

  @ApiProperty({ description: 'The specialization of the facilitator' })
  @IsString()
  @Length(2, 100)
  specialization: string;

  @ApiProperty({ description: 'The qualification of the facilitator' })
  @IsString()
  @Length(2, 200)
  qualification: string;

  @ApiProperty({ description: 'The hire date of the facilitator' })
  @IsDateString()
  hireDate: string;

  @ApiProperty({ description: 'The department of the facilitator', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  department?: string;
}
