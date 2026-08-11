import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Facilitator } from './entity/facilitator.entity';
import { Repository } from 'typeorm';
import { CreateFacilitatorDto } from './dto/create-facilitator.dto';
import { UpdateFacilitatorDto } from './dto/update-facilitator.dto';
import { UserService } from '../user/user.service';
import { Role } from '../user/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { FacilitatorStatus } from './enum/facilitator.status.enum';

@Injectable()
export class FacilitatorService {
  constructor(
    @InjectRepository(Facilitator)
    private readonly facilitatorRepository: Repository<Facilitator>,
    private readonly userService: UserService,
  ) {}

  async create(createDto: CreateFacilitatorDto): Promise<Facilitator> {
    const existingUser = await this.userService.findByEmail(createDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createDto.password, 10);
    const user = await this.userService.create({
      name: createDto.fullName, // Mapping fullName to name
      email: createDto.email,
      password: hashedPassword,
      role: Role.FACILITATOR,
    });

    const facilitator = this.facilitatorRepository.create({
      user,
      specialization: createDto.specialization,
      qualification: createDto.qualification,
      hireDate: createDto.hireDate,
      department: createDto.department,
    });

    return await this.facilitatorRepository.save(facilitator);
  }

  async findAll(): Promise<Facilitator[]> {
    return await this.facilitatorRepository.find({
      relations: { user: true },
    });
  }

  async findById(id: number): Promise<Facilitator> {
    const facilitator = await this.facilitatorRepository.findOne({
      where: { id },
      relations: { user: true, classes: true },
    });
    if (!facilitator) {
      throw new NotFoundException(`Facilitator with ID ${id} not found`);
    }
    return facilitator;
  }

  async update(id: number, updateDto: UpdateFacilitatorDto): Promise<Facilitator> {
    const facilitator = await this.findById(id);

    // If updating fullName, update the linked User
    if (updateDto.fullName) {
      await this.userService.update(facilitator.user.id, {
        name: updateDto.fullName,
      });
      // Refresh user object
      facilitator.user.name = updateDto.fullName;
    }

    if (updateDto.specialization) facilitator.specialization = updateDto.specialization;
    if (updateDto.qualification) facilitator.qualification = updateDto.qualification;
    if (updateDto.department) facilitator.department = updateDto.department;
    if (updateDto.availability) facilitator.availability = updateDto.availability;

    return await this.facilitatorRepository.save(facilitator);
  }

  async updateStatus(id: number, status: string): Promise<Facilitator> {
    const facilitator = await this.findById(id);
    facilitator.status = status as any;
    return await this.facilitatorRepository.save(facilitator);
  }

  async updateAvailability(id: number, availability: any): Promise<Facilitator> {
    const facilitator = await this.findById(id);
    facilitator.availability = availability;
    return await this.facilitatorRepository.save(facilitator);
  }

  async delete(id: number): Promise<void> {
    const facilitator = await this.findById(id);
    // Soft delete
    facilitator.status = FacilitatorStatus.INACTIVE;
    await this.facilitatorRepository.save(facilitator);
  }

  // --- MOCK ENDPOINTS FOR PHASE 2 ---
  async getClasses(id: number) {
    const facilitator = await this.findById(id);
    return {
      message: 'Mock: Returns assigned classes for the facilitator',
      facilitatorId: id,
      classes: [],
    };
  }

  async getStudents(id: number) {
    const facilitator = await this.findById(id);
    return {
      message: 'Mock: Returns all students taught by the facilitator',
      facilitatorId: id,
      students: [],
    };
  }

  async getPerformanceMetrics(id: number) {
    const facilitator = await this.findById(id);
    return {
      message: 'Mock: Returns performance metrics',
      facilitatorId: id,
      performanceRating: facilitator.performanceRating,
      metrics: {
        averageStudentGrade: 85,
        classCompletionRate: 98,
        studentPassRate: 95,
      },
    };
  }

  async updatePerformanceRating(id: number, rating: number) {
    const facilitator = await this.findById(id);
    facilitator.performanceRating = rating;
    return await this.facilitatorRepository.save(facilitator);
  }

  async getSchedule(id: number) {
    const facilitator = await this.findById(id);
    return {
      message: 'Mock: Returns the teaching schedule',
      facilitatorId: id,
      schedule: [],
    };
  }
}
