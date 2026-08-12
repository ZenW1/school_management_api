import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../entities/grade.entity';
import { Assignment } from '../entities/assignment.entity';
import { Submission } from '../entities/submission.entity';
import { CreateGradeDto } from '../dto/create-grade.dto';
import { UpdateGradeDto } from '../dto/update-grade.dto';
import { SubmissionStatus } from '../enums/submission-status.enum';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
  ) {}

  async createGrade(dto: CreateGradeDto, gradedBy: any): Promise<Grade> {
    if (!dto.assignmentId && !dto.classId) {
      throw new BadRequestException('Must provide assignmentId or classId');
    }

    let maxScore = 100;
    let weight = dto.weight || 1.0;
    let latePenalty = 0;

    let submission: Submission | null = null;
    if (dto.assignmentId) {
      const assignment = await this.assignmentRepository.findOne({ where: { id: dto.assignmentId } });
      if (!assignment) throw new NotFoundException('Assignment not found');
      
      maxScore = assignment.maxScore;
      if (!dto.weight) weight = assignment.weight;

      // Link to submission
      submission = await this.submissionRepository.findOne({ 
        where: { assignmentId: dto.assignmentId, studentId: dto.studentId } 
      });

      if (submission && submission.latePenalty) {
        latePenalty = submission.latePenalty;
      }
    }

    if (dto.score > maxScore) {
      throw new BadRequestException(`Score cannot exceed max score of ${maxScore}`);
    }

    // Apply late penalty
    const finalScore = dto.score * (1 - latePenalty);
    const weightedScore = (finalScore / maxScore) * weight;

    const grade = this.gradeRepository.create({
      ...dto,
      student: { id: dto.studentId },
      class: dto.classId ? { id: dto.classId } : null,
      assignment: dto.assignmentId ? { id: dto.assignmentId } : null,
      gradedBy: { id: gradedBy.id },
      maxScore,
      weight,
      score: finalScore,
      weightedScore,
    } as any) as any as Grade;

    const savedGrade = await this.gradeRepository.save(grade);

    if (submission) {
      submission.grade = savedGrade as any;
      submission.status = SubmissionStatus.GRADED;
      await this.submissionRepository.save(submission);
    }

    return savedGrade;
  }

  async updateGrade(id: number, dto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.gradeRepository.findOne({ where: { id } });
    if (!grade) throw new NotFoundException('Grade not found');

    this.gradeRepository.merge(grade, dto);
    
    // Recalculate if score changed
    if (dto.score !== undefined) {
      if (dto.score > grade.maxScore) {
        throw new BadRequestException(`Score cannot exceed max score of ${grade.maxScore}`);
      }
      grade.weightedScore = (grade.score / grade.maxScore) * grade.weight;
    }

    return await this.gradeRepository.save(grade);
  }

  async getStudentGrades(studentId: number, classId?: number): Promise<Grade[]> {
    const where: any = { studentId };
    if (classId) where.classId = classId;

    return await this.gradeRepository.find({
      where,
      relations: { assignment: true, class: true },
      order: { gradedAt: 'DESC' }
    });
  }

  async getClassGrades(classId: number): Promise<Grade[]> {
    return await this.gradeRepository.find({
      where: { classId },
      relations: { student: true, assignment: true },
    });
  }
}
