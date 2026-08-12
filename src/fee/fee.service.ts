import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee } from './entity/fee.entity';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';

@Injectable()
export class FeeService {
  constructor(
    @InjectRepository(Fee)
    private readonly feeRepository: Repository<Fee>,
  ) {}

  async create(createFeeDto: CreateFeeDto): Promise<Fee> {
    const fee = this.feeRepository.create(createFeeDto);
    return this.feeRepository.save(fee);
  }

  async findAll(): Promise<Fee[]> {
    return this.feeRepository.find({ relations: { student: true } });
  }

  async findOne(id: number): Promise<Fee> {
    const fee = await this.feeRepository.findOne({
      where: { id },
      relations: { student: true },
    });
    if (!fee) {
      throw new NotFoundException(`Fee with ID ${id} not found`);
    }
    return fee;
  }

  async findByStudent(studentId: number): Promise<Fee[]> {
    return this.feeRepository.find({
      where: { studentId },
    });
  }

  async update(id: number, updateFeeDto: UpdateFeeDto): Promise<Fee> {
    const fee = await this.findOne(id);
    Object.assign(fee, updateFeeDto);
    return this.feeRepository.save(fee);
  }

  async remove(id: number): Promise<void> {
    const fee = await this.findOne(id);
    await this.feeRepository.remove(fee);
  }
}
