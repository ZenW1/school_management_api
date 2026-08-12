import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Assignment } from './assignment.entity';
import { Student } from '../../student/entity/student.entity';
import { Grade } from './grade.entity';
import { SubmissionStatus } from '../enums/submission-status.enum';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Assignment, { eager: true })
  @JoinColumn({ name: 'assignmentId' })
  assignment: Assignment;

  @Column()
  assignmentId: number;

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;

  @Column({ nullable: true })
  submissionUrl: string;

  @Column({ type: 'text', nullable: true })
  submittedContent: string;

  @Column({ nullable: true })
  fileName?: string;

  @Column({ type: 'int', nullable: true })
  fileSizeBytes?: number;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING
  })
  status: SubmissionStatus;

  @CreateDateColumn()
  submittedAt: Date;

  @Column({ type: 'boolean', default: false })
  isLate: boolean;

  @Column({ nullable: true, type: 'decimal', precision: 5, scale: 2 })
  latePenalty?: number;

  @OneToOne(() => Grade, { nullable: true })
  @JoinColumn({ name: 'gradeId' })
  grade?: Grade;

  @UpdateDateColumn()
  updatedAt: Date;
}
