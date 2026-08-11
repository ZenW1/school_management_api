import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entity/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const newClass = this.classRepository.create(createClassDto);
    return await this.classRepository.save(newClass);
  }

  async findAll(): Promise<Class[]> {
    return await this.classRepository.find({ relations: { course: true } });
  }

  async findOne(id: number): Promise<Class> {
    const classEntity = await this.classRepository.findOne({ 
      where: { id },
      relations: { course: true }
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classEntity;
  }

  async update(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
    const classEntity = await this.findOne(id);
    this.classRepository.merge(classEntity, updateClassDto);
    return await this.classRepository.save(classEntity);
  }

  async remove(id: number): Promise<void> {
    const classEntity = await this.findOne(id);
    await this.classRepository.remove(classEntity);
  }
}
