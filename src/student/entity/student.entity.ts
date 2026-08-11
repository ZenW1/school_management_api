import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { StudentStatus } from '../enum/student.status.enum';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

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
