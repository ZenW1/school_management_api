import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ClassStatus } from '../enum/class-status.enum';
import { Course } from '../../course/entity/course.entity';
import { Facilitator } from '../../facilitator/entity/facilitator.entity';
import { LearningMaterial } from '../../learning-material/entity/learning-material.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  courseId: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ nullable: true })
  facilitatorId: number;

  @ManyToOne(() => Facilitator, (facilitator) => facilitator.classes)
  @JoinColumn({ name: 'facilitatorId' })
  facilitator: Facilitator;

  @Column()
  className: string;

  @Column('int')
  capacity: number;

  // JSONB is postgres specific. In mysql it's just 'json'. We'll use 'jsonb'.
  @Column({ type: 'jsonb' })
  schedule: Record<string, any>;

  @Column({ nullable: true })
  semester: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'int', default: 0 })
  enrolledCount: number;

  @Column({
    type: 'enum',
    enum: ClassStatus,
    default: ClassStatus.UPCOMING,
  })
  status: ClassStatus;

  @OneToMany(() => LearningMaterial, (lm) => lm.class)
  materials: LearningMaterial[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
