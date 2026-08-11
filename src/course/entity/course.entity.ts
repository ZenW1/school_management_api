import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CourseStatus } from '../enum/course-status.enum';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('int')
  credits: number;

  @Column({ nullable: true })
  prerequisites: string; // Could be JSON or comma-separated for now

  @Column({ nullable: true })
  syllabusUrl: string;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.ACTIVE,
  })
  status: CourseStatus;
}
