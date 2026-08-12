import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query } from '@nestjs/common';
import { GradesService } from '../services/grades.service';
import { CreateGradeDto } from '../dto/create-grade.dto';
import { UpdateGradeDto } from '../dto/update-grade.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../user/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post('grades')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  create(@Body() createGradeDto: CreateGradeDto, @Req() req: any) {
    return this.gradesService.createGrade(createGradeDto, req.user);
  }

  @Patch('grades/:id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradesService.updateGrade(+id, updateGradeDto);
  }

  @Get('students/:studentId/grades')
  @Roles(Role.USER)
  getStudentGrades(@Param('studentId') studentId: string, @Query('classId') classId?: string) {
    return this.gradesService.getStudentGrades(+studentId, classId ? +classId : undefined);
  }

  @Get('classes/:classId/grades')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  getClassGrades(@Param('classId') classId: string) {
    return this.gradesService.getClassGrades(+classId);
  }
}
