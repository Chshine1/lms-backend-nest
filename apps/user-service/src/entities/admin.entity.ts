import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AdminContract } from '@app/contracts/user/entities/admin.contract';

@Entity('admins')
export class Admin implements AdminContract {
  @PrimaryColumn({ name: 'user_id' })
  userId!: number;

  @Column()
  department!: string;

  @Column({ name: 'job_title', nullable: true })
  jobTitle?: string;
}
