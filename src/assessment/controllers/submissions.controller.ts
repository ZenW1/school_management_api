import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { SubmissionsService } from '../services/submissions.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../user/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('assignments/:assignmentId/submissions')
  @Roles(Role.STUDENT, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  submitAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body('studentId') studentId: string,
    @Body('content') content?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.submissionsService.submitAssignment(+assignmentId, +studentId, content, file);
  }

  @Get('assignments/:assignmentId/submissions')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  findAll(@Param('assignmentId') assignmentId: string) {
    return this.submissionsService.findAllByAssignment(+assignmentId);
  }

  @Get('submissions/:id')
  @Roles(Role.USER)
  findOne(@Param('id') id: string) {
    return this.submissionsService.findById(+id);
  }
}
