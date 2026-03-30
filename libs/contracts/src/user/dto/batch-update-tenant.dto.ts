import { ApiProperty } from '@nestjs/swagger';

export class CampusBatchDto {
  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  location?: string;
}

export class BatchUpdateTenantDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty({ required: false })
  status?: 'active' | 'suspended';

  @ApiProperty({ type: [CampusBatchDto], required: false })
  campuses?: CampusBatchDto[];
}
