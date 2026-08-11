import { Controller, Post, UseInterceptors, UploadedFile, Get, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file to the OS file system' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.mediaService.createMediaRecord(file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all uploaded media records' })
  async getMedia() {
    return await this.mediaService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media record and its corresponding file' })
  async deleteMedia(@Param('id', ParseIntPipe) id: number) {
    await this.mediaService.remove(id);
    return { message: 'Media deleted successfully' };
  }
}
