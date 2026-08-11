import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Course } from '../../course/entity/course.entity';
import { Class } from '../../class/entity/class.entity';
import { User } from '../../user/entity/user.entity';
import { FileType } from '../enum/file-type.enum';
import { Visibility } from '../enum/visibility.enum';

@Entity('learning_materials')
export class LearningMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, { eager: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: number;

  @ManyToOne(() => Class, { nullable: true })
  @JoinColumn({ name: 'classId' })
  class?: Class;

  @Column({ nullable: true })
  classId?: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  fileUrl: string;

  @Column()
  fileName: string;

  @Column({ type: 'int' })
  fileSizeBytes: number;

  @Column({
    type: 'enum',
    enum: FileType,
  })
  fileType: FileType;

  @Column({ nullable: true })
  week?: number;

  @Column({ nullable: true })
  topic?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedBy' })
  uploadedBy: User;

  @Column({
    type: 'enum',
    enum: Visibility,
    default: Visibility.PRIVATE,
  })
  visibility: Visibility;

  @Column({ type: 'int', default: 0 })
  downloadCount: number;

  @Column({ type: 'text', nullable: true })
  tags: string; // Comma-separated tags

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  uploadDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
