import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  age: string;

  @Column()
  address: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  refreshToken: string;
  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToMany(() => Role)
  @JoinTable({ name: 'user_roles' })
  roles: Role[];
}
