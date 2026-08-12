import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../student/entity/student.entity';
import { Class } from '../../class/entity/class.entity';
import { Assignment } from './assignment.entity';
import { User } from '../../user/entity/user.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne(() => Class, { nullable: true })
  @JoinColumn({ name: 'classId' })
  class?: Class;

  @Column({ nullable: true })
  classId?: number;

  @ManyToOne(() => Assignment, { nullable: true })
  @JoinColumn({ name: 'assignmentId' })
  assignment?: Assignment;

  @Column({ nullable: true })
  assignmentId?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  maxScore: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1 })
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weightedScore: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'gradedBy' })
  gradedBy: User;

  @CreateDateColumn()
  gradedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  rubricScores?: Record<string, number>;
}
