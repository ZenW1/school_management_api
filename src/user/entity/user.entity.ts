import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../enums/role.enum';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'timestamp', nullable: true })
  dob: Date;

  @Exclude()
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  refreshToken: string | null;
}
