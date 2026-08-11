import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DocumentType } from '../enum/document-type.enum';

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType, description: 'Type of the document' })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  documentType: DocumentType;

  @ApiProperty({ description: 'URL of the uploaded file' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;
}
