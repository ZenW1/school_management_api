import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../entities/assignment.entity';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';
import { UpdateAssignmentDto } from '../dto/update-assignment.dto';
import { AssignmentStatus } from '../enums/assignment-status.enum';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
  ) {}

  async create(dto: CreateAssignmentDto, user: any): Promise<Assignment> {
    const assignment = this.assignmentRepository.create({
      ...dto,
      class: { id: dto.classId } as any,
      createdBy: { id: user.id } as any,
    });
    return await this.assignmentRepository.save(assignment);
  }

  async findAll(classId?: number): Promise<Assignment[]> {
    const where = classId ? { classId } : {};
    return await this.assignmentRepository.find({
      where,
      relations: { class: true, createdBy: true },
      order: { dueDate: 'ASC' }
    });
  }

  async findById(id: number): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: { class: true, createdBy: true, submissions: true, grades: true }
    });
    if (!assignment) throw new NotFoundException(`Assignment ${id} not found`);
    return assignment;
  }

  async update(id: number, dto: UpdateAssignmentDto): Promise<Assignment> {
    const assignment = await this.findById(id);
    if (assignment.status !== AssignmentStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT assignments can be updated');
    }
    this.assignmentRepository.merge(assignment, dto);
    return await this.assignmentRepository.save(assignment);
  }

  async publish(id: number): Promise<Assignment> {
    const assignment = await this.findById(id);
    if (assignment.status !== AssignmentStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT assignments can be published');
    }
    assignment.status = AssignmentStatus.PUBLISHED;
    return await this.assignmentRepository.save(assignment);
  }

  async close(id: number): Promise<Assignment> {
    const assignment = await this.findById(id);
    assignment.status = AssignmentStatus.CLOSED;
    return await this.assignmentRepository.save(assignment);
  }

  async remove(id: number): Promise<void> {
    const assignment = await this.findById(id);
    if (assignment.status !== AssignmentStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT assignments can be deleted');
    }
    await this.assignmentRepository.remove(assignment);
  }
}
