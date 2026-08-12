import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from '../entities/submission.entity';
import { Assignment } from '../entities/assignment.entity';
import { SubmissionStatus } from '../enums/submission-status.enum';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
  ) {}

  async submitAssignment(assignmentId: number, studentId: number, content?: string, file?: Express.Multer.File): Promise<Submission> {
    const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    
    // Check if already submitted
    const existing = await this.submissionRepository.findOne({ where: { assignmentId, studentId } });
    if (existing) throw new ConflictException('Already submitted');

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileSizeBytes: number | null = null;

    if (file) {
      fileName = file.originalname;
      fileSizeBytes = file.size;
      fileUrl = `https://mock-s3.amazonaws.com/submissions/${Date.now()}-${fileName}`;
    }

    const submittedAt = new Date();
    const isLate = submittedAt > assignment.dueDate;
    const latePenalty = this.checkLatePenalty(submittedAt, assignment.dueDate);

    const submission = this.submissionRepository.create({
      assignmentId,
      studentId,
      submissionUrl: fileUrl,
      fileName,
      fileSizeBytes,
      submittedContent: content,
      status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
      isLate,
      latePenalty,
      submittedAt,
    } as any) as any as Submission;

    return await this.submissionRepository.save(submission);
  }

  async findById(id: number): Promise<Submission> {
    const sub = await this.submissionRepository.findOne({ 
      where: { id },
      relations: { assignment: true, student: true, grade: true }
    });
    if (!sub) throw new NotFoundException('Submission not found');
    return sub;
  }

  async findAllByAssignment(assignmentId: number): Promise<Submission[]> {
    return await this.submissionRepository.find({
      where: { assignmentId },
      relations: { student: true, grade: true },
      order: { submittedAt: 'DESC' }
    });
  }

  private checkLatePenalty(submittedAt: Date, dueDate: Date): number {
    if (submittedAt <= dueDate) return 0;
    
    const diffTime = Math.abs(submittedAt.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    // 5% per day, max 50%
    const penalty = diffDays * 0.05;
    return Math.min(penalty, 0.50);
  }
}
