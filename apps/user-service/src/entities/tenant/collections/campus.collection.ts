import { BadRequestException } from '@nestjs/common';
import { Tenant } from '@/user-service/src/entities/tenant/tenant.entity';
import { Campus } from '@/user-service/src/entities/tenant/campus.entity';
import { CampusBatchDto } from '@app/contracts';

export class CampusCollection {
  private constructor(
    private readonly tenant: Tenant,
    private readonly campuses: Campus[],
  ) {}

  static create(tenant: Tenant, campuses: Campus[]): CampusCollection {
    return new CampusCollection(tenant, campuses);
  }

  updateCampuses(campusDtos: CampusBatchDto[]): void {
    for (const dto of campusDtos) {
      if (dto.id !== undefined) {
        this.updateExistingCampus(dto.id, dto);
      } else {
        this.createNewCampus(dto);
      }
    }
  }

  private updateExistingCampus(id: number, dto: CampusBatchDto): void {
    const campus = this.campuses.find((c) => c.id === id);
    if (campus === undefined) {
      throw new BadRequestException(
        `Campus with id ${String(dto.id)} not found`,
      );
    }

    if (dto.name !== undefined) campus.name = dto.name;
    if (dto.location !== undefined) campus.location = dto.location;
  }

  private createNewCampus(dto: CampusBatchDto): Campus {
    if (dto.name === undefined || dto.location === undefined) {
      throw new BadRequestException('Missing required fields for new campus');
    }

    const campus = new Campus();

    campus.name = dto.name;
    campus.location = dto.location;

    campus.tenant = this.tenant;
    this.campuses.push(campus);
    return campus;
  }
}
