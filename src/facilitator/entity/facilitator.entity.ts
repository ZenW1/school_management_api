import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { FacilitatorStatus } from '../enum/facilitator.status.enum';
import { Class } from '../../class/entity/class.entity';

@Entity('facilitators')
export class Facilitator {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  qualification: string;

  @Column({ nullable: true })
  hireDate: Date;

  @Column({ nullable: true })
  department: string;

  @Column({
    type: 'enum',
    enum: FacilitatorStatus,
    default: FacilitatorStatus.ACTIVE,
  })
  status: FacilitatorStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  performanceRating: number;

  @Column({ type: 'int', default: 0 })
  totalClassesAssigned: number;

  @Column({ type: 'int', default: 0 })
  totalStudentsTaught: number;

  @OneToMany(() => Class, (cls) => cls.facilitator)
  classes: Class[];

  // @OneToMany(() => Grade, grade => grade.gradedBy)
  // gradesGiven: Grade[];

  @Column({ type: 'jsonb', nullable: true })
  availability: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
