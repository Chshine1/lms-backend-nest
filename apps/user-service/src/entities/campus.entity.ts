import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { CampusContract } from '@app/contracts';

@Entity('campuses')
export class Campus implements CampusContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'tenant_id' })
  tenantId!: number;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  location!: string;

  @Column({ nullable: true })
  timezone?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;
}
