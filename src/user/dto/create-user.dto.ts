import { IsDate, IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: new Date().toISOString(),
    description: 'Date of birth',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dob?: Date;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
