import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() createClassDto: CreateClassDto) {
    return this.classService.create(createClassDto);
  }

  @Get()
  @Roles(Role.USER)
  findAll() {
    return this.classService.findAll();
  }

  @Get(':id')
  @Roles(Role.USER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.update(id, updateClassDto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER)
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    return this.classService.updateStatus(id, status);
  }

  // --- MOCK ENDPOINTS FOR PHASE 2 ---
  @Get(':id/students')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  getEnrolledStudents(@Param('id', ParseIntPipe) id: number) {
    return { message: `Returning enrolled students for class ${id}`, data: [] };
  }

  @Post(':id/enroll')
  @Roles(Role.ADMIN, Role.MANAGER)
  enrollStudent(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return { message: `Student enrolled in class ${id}` };
  }

  @Delete(':id/students/:studentId')
  @Roles(Role.ADMIN, Role.MANAGER)
  removeStudent(@Param('id', ParseIntPipe) id: number, @Param('studentId', ParseIntPipe) studentId: number) {
    return { message: `Student ${studentId} removed from class ${id}` };
  }

  @Get(':id/attendance')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  getAttendance(@Param('id', ParseIntPipe) id: number) {
    return { message: `Returning attendance for class ${id}`, data: [] };
  }

  @Post(':id/attendance')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  markAttendance(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return { message: `Attendance marked for class ${id}` };
  }
}
