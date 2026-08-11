import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create-student-dto';
import { Student } from './entity/student.entity';
import { UpdateStudentDto } from './dto/update-student-dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('student')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<Student> {
    return await this.studentService.create(createStudentDto);
  }

  @Get()
  async searchStudentByName(
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return await this.studentService.findStudentByName(search, page, limit);
  }

  @Get(':id')
  async getStudentById(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findStudentById(id);
  }

  @Put(':id')
  async updateStudentInfo(
    @Param('id') id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return await this.studentService.updateStudentInfo(id, updateStudentDto);
  }
}
