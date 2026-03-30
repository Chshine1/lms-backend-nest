import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity, CampusContract } from '@app/contracts';
import { Tenant } from './tenant.entity';

@Entity('campuses')
export class Campus extends BaseEntity implements CampusContract {
  @Column({ name: 'tenant_id' })
  tenantId!: number;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  location!: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.campuses, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;
}
