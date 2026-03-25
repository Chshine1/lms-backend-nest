import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ParentContract } from '@app/contracts';

@Entity('parents')
export class Parent implements ParentContract {
  @PrimaryColumn({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'relation_to_student' })
  relationToStudent!: string;

  @Column({ nullable: true })
  occupation?: string;
}
