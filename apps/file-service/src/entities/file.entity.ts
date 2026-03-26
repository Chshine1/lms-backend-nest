import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { FileContract } from '@app/contracts';

@Entity('files')
@Unique('UQ_files_storage_key', ['storageKey'])
@Index('IDX_files_content_type', ['contentType'])
@Index('IDX_files_created_by', ['createdBy'])
export class File implements FileContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'storage_key', type: 'varchar', length: 512 })
  storageKey!: string;

  @Column({ name: 'content_type', type: 'varchar', length: 100 })
  contentType!: string;

  @Column({
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: bigint) => Number(value),
    },
  })
  size!: number;

  @Column({ type: 'varchar', length: 64 })
  checksum!: string;

  @Column({ name: 'created_by', type: 'int' })
  createdBy!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;
}
