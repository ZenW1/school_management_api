import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Class } from '../../class/entity/class.entity';
import { User } from '../../user/entity/user.entity';
import { Submission } from './submission.entity';
import { Grade } from './grade.entity';
import { AssignmentStatus } from '../enums/assignment-status.enum';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Class, { eager: true })
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column()
  classId: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  maxScore: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1 })
  weight: number;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  submissionDeadlineExtension?: Date;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.DRAFT
  })
  status: AssignmentStatus;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @OneToMany(() => Submission, submission => submission.assignment)
  submissions: Submission[];

  @OneToMany(() => Grade, grade => grade.assignment)
  grades: Grade[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
