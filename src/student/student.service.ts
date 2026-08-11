import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entity/student.entity';
import { ILike, Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student-dto';
import { UpdateStudentDto } from './dto/update-student-dto';

/**

 * GET    /students               - List all students (admin/manager)
 * POST   /students               - Create student profile (admin/manager)
 * GET    /students/:id           - Get student details
 * PATCH  /students/:id           - Update student profile
 * DELETE /students/:id           - Deactivate student
 * GET    /students/:id/courses   - Get enrolled courses
 * GET    /students/:id/grades    - Get student grades
 * GET    /students/:id/attendance- Get attendance record
 * **/

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const student = this.studentRepository.create(createStudentDto);
    return await this.studentRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find();
  }

  async findStudentById(id: number): Promise<Student | null> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    return student;
  }

  async findStudentByName(
    search: string = '',
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const whereCondition = search
      ? [{ name: ILike(`%${search}%`) }, { email: ILike(`%${search}%`) }]
      : {};

    const [data, total] = await this.studentRepository.findAndCount({
      where: whereCondition,
      skip,
      take: limit,
      order: { id: 'ASC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    };
  }

  async updateStudentInfo(id: number, updateStudentDto: UpdateStudentDto) {
    const student = await this.findStudentById(id);
    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    this.studentRepository.merge(student, updateStudentDto);
    return await this.studentRepository.save(student);
  }

  async deleteStudent(id: number) {
    const student = await this.findStudentById(id);
    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    return await this.studentRepository.remove(student);
  }
}
