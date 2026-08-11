import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Length, Min, Max, IsBoolean } from 'class-validator';
import { Visibility } from '../enum/visibility.enum';
import { Transform } from 'class-transformer';

export class UploadMaterialDto {
  @ApiProperty({ description: 'The ID of the related Course', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  courseId: number;

  @ApiProperty({ required: false, description: 'The ID of the specific class', example: 1 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  classId?: number;

  @ApiProperty({ description: 'Title of the material', example: 'Week 1 Slides' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @ApiProperty({ required: false, description: 'Description of the material' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, description: 'Week number', example: 1 })
  @IsNumber()
  @Min(1)
  @Max(52)
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  week?: number;

  @ApiProperty({ required: false, description: 'Topic name', example: 'Introduction' })
  @IsString()
  @IsOptional()
  topic?: string;

  @ApiProperty({ enum: Visibility, description: 'Visibility level' })
  @IsEnum(Visibility)
  @IsNotEmpty()
  visibility: Visibility;

  @ApiProperty({ required: false, description: 'Comma-separated tags', example: 'math,basics' })
  @IsString()
  @IsOptional()
  tags?: string;
}
