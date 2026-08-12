import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.FACILITATOR)
  @ApiOperation({ summary: 'Create attendance record' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.FACILITATOR)
  @ApiOperation({ summary: 'Get all attendance records' })
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get('student/:studentId')
  @Roles(Role.ADMIN, Role.FACILITATOR, Role.STUDENT)
  @ApiOperation({ summary: 'Get attendance by student ID' })
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.attendanceService.findByStudent(studentId);
  }

  @Get('class/:classId')
  @Roles(Role.ADMIN, Role.FACILITATOR)
  @ApiOperation({ summary: 'Get attendance by class ID' })
  findByClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.attendanceService.findByClass(classId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.FACILITATOR)
  @ApiOperation({ summary: 'Get an attendance record' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.FACILITATOR)
  @ApiOperation({ summary: 'Update an attendance record' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an attendance record' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}
