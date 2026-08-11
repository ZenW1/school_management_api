import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Role } from '../../user/enums/role.enum';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsDateString()
  dob?: Date;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
