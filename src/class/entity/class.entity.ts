import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ClassStatus } from '../enum/class-status.enum';
import { Course } from '../../course/entity/course.entity';

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  courseId: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'int', nullable: true })
  facilitatorId: number; // Nullable until Facilitator entity is built

  @Column()
  className: string;

  @Column('int')
  capacity: number;

  // JSONB is postgres specific. In mysql it's just 'json'. We'll use 'jsonb'.
  @Column({ type: 'jsonb' })
  schedule: Record<string, any>; 

  @Column()
  semester: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ClassStatus,
    default: ClassStatus.UPCOMING,
  })
  status: ClassStatus;
}
