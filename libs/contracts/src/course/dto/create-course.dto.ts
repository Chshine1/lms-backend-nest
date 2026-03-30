import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  tenantId!: number;

  @ApiProperty({ type: [Number], required: false })
  teachers?: number[];
}
