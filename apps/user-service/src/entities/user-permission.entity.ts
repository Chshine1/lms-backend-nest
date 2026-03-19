import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from '@app/authentication/contracts/permission.interface';

export enum UserServiceResource {
  DOCUMENT = 1,
  COMMENT = 2,
  USER = 3,
}

export enum UserServiceAction {
  READ = 1,
  WRITE = 2,
  DELETE = 3,
  MANAGE = 4,
}

@Entity('user_permissions')
export class UserPermission implements Permission {
  @PrimaryGeneratedColumn()
  @Index()
  userId!: number;

  @PrimaryGeneratedColumn()
  @Column({
    type: 'smallint',
    transformer: {
      to: (value: UserServiceResource) => value,
      from: (value: number) => value as UserServiceResource,
    },
  })
  resource!: UserServiceResource;

  @PrimaryGeneratedColumn()
  @Column({
    type: 'smallint',
    transformer: {
      to: (value: UserServiceAction) => value,
      from: (value: number) => value as UserServiceAction,
    },
  })
  action!: UserServiceAction;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
