import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create-student-dto';
import { Student } from './entity/student.entity';
import { UpdateStudentDto } from './dto/update-student-dto';
import { CreateDocumentDto } from './dto/create-document.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<Student> {
    return await this.studentService.create(createStudentDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  async searchStudentByName(
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return await this.studentService.findStudentByName(search, page, limit);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STUDENT)
  async getStudentById(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findStudentById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STUDENT)
  async updateStudentInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return await this.studentService.updateStudentInfo(id, updateStudentDto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER)
  async updateStudentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return await this.studentService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async deleteStudent(@Param('id', ParseIntPipe) id: number) {
    await this.studentService.deleteStudent(id);
    return { message: 'Student deleted successfully' };
  }

  // --- MOCK ENDPOINTS FOR ACADEMIC TRACKING ---
  
  @Get(':id/courses')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STUDENT)
  async getStudentCourses(@Param('id', ParseIntPipe) id: number) {
    return {
      message: `Returning enrolled courses for student ${id}`,
      data: [] // Placeholder until Course management is built
    };
  }

  @Get(':id/grades')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STUDENT)
  async getStudentGrades(@Param('id', ParseIntPipe) id: number) {
    return {
      message: `Returning grades for student ${id}`,
      data: [] // Placeholder until Grading module is built
    };
  }

  @Get(':id/attendance')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STUDENT)
  async getStudentAttendance(@Param('id', ParseIntPipe) id: number) {
    return {
      message: `Returning attendance record for student ${id}`,
      data: [] // Placeholder until Attendance module is built
    };
  }

  // --- DOCUMENT MANAGEMENT ---
  @Post(':id/documents')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STUDENT)
  async uploadDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return await this.studentService.addDocument(id, createDocumentDto);
  }

  @Get(':id/documents')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STUDENT)
  async getDocuments(@Param('id', ParseIntPipe) id: number) {
    return await this.studentService.getDocuments(id);
  }
}
