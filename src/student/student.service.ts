import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entity/student.entity';
import { ILike, Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student-dto';
import { UpdateStudentDto } from './dto/update-student-dto';
import { DocumentUpload } from './entity/document-upload.entity';
import { CreateDocumentDto } from './dto/create-document.dto';

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
    @InjectRepository(DocumentUpload)
    private readonly documentRepository: Repository<DocumentUpload>,
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
    const queryBuilder = this.studentRepository.createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .skip(skip)
      .take(limit)
      .orderBy('student.id', 'ASC');

    if (search) {
      queryBuilder.where('student.name ILIKE :search OR user.email ILIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

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

  // --- DOCUMENT MANAGEMENT ---
  async addDocument(studentId: number, createDocumentDto: CreateDocumentDto): Promise<DocumentUpload> {
    const student = await this.findStudentById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with id ${studentId} not found`);
    }

    const document = this.documentRepository.create({
      ...createDocumentDto,
      userId: student.userId, // Link document directly to the User ID mapped to this student
    });
    
    return await this.documentRepository.save(document);
  }

  async getDocuments(studentId: number): Promise<DocumentUpload[]> {
    const student = await this.findStudentById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with id ${studentId} not found`);
    }

    return await this.documentRepository.find({
      where: { userId: student.userId },
    });
  }
}
