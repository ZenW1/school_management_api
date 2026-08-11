import { Controller, Post, Get, Patch, Delete, Param, Body, UseInterceptors, UploadedFile, Request, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LearningMaterialService } from './learning-material.service';
import { UploadMaterialDto } from './dto/upload-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';

@ApiTags('Learning Materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('materials')
export class LearningMaterialController {
  constructor(private readonly learningMaterialService: LearningMaterialService) {}

  @Post('upload')
  @Roles(Role.ADMIN, Role.FACILITATOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        courseId: { type: 'number' },
        classId: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        visibility: { type: 'string' }
      },
    },
  })
  upload(
    @Body() uploadDto: UploadMaterialDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    // In reality we would handle errors if file is not provided
    return this.learningMaterialService.uploadMaterial(uploadDto, file, req.user);
  }

  @Get()
  @Roles(Role.USER) // Will filter by access inside service in a real scenario
  findAll() {
    return this.learningMaterialService.findAll();
  }

  @Get(':id')
  @Roles(Role.USER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.learningMaterialService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.FACILITATOR) // Should check if user is uploader in real scenario
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateMaterialDto) {
    return this.learningMaterialService.updateMaterial(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.FACILITATOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.learningMaterialService.deleteMaterial(id);
  }

  @Get(':id/download')
  @Roles(Role.USER)
  download(@Param('id', ParseIntPipe) id: number) {
    return this.learningMaterialService.downloadMaterial(id);
  }
}
