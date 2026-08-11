import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CourseStatus } from '../enum/course-status.enum';
import { User } from '../../user/entity/user.entity';
import { Class } from '../../class/entity/class.entity';
import { LearningMaterial } from '../../learning-material/entity/learning-material.entity';

@Entity('courses')
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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @OneToMany(() => Class, (cls) => cls.course)
  classes: Class[];

  @OneToMany(() => LearningMaterial, (lm) => lm.course)
  materials: LearningMaterial[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
