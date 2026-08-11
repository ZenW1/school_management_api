import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StudentStatus } from '../enum/student.status.enum';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column()
  enrollmentDate: Date;

  @Column()
  parentName: string;

  @Column()
  parentPhone: string;

  @Column()
  address: string;

  @Column()
  dateOfBirth: Date;

  @Column()
  gpa: number;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.ACTIVE,
  })
  status: StudentStatus;
}
