import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity, CampusBatchDto, TenantContract } from '@app/contracts';
import { Campus } from './campus.entity';
import { CampusCollection } from './collections/campus.collection';

@Entity('tenants')
export class Tenant extends BaseEntity implements TenantContract {
  @Column()
  name!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ default: 'active' })
  status!: 'active' | 'suspended';

  @OneToMany(() => Campus, (campus) => campus.tenant, {
    cascade: true,
  })
  campuses!: Campus[];

  updateCampuses(campusDtos: CampusBatchDto[]): void {
    CampusCollection.create(this, this.campuses).updateCampuses(campusDtos);
  }
}
