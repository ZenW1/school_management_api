import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entity/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseStatus } from './enum/course-status.enum';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto, user: any): Promise<Course> {
    const existing = await this.courseRepository.findOne({ where: { code: createCourseDto.code } });
    if (existing) {
      throw new ConflictException(`Course with code ${createCourseDto.code} already exists`);
    }
    const course = this.courseRepository.create({
      ...createCourseDto,
      createdBy: { id: user.id } as any, // Assign user reference
    });
    return await this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find();
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    this.courseRepository.merge(course, updateCourseDto);
    return await this.courseRepository.save(course);
  }

  async remove(id: number): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }

  async archiveCourse(id: number): Promise<Course> {
    const course = await this.findOne(id);
    course.status = CourseStatus.ARCHIVED;
    return await this.courseRepository.save(course);
  }
}
