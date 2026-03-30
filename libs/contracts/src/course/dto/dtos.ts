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

export class AssignmentBatchDto {
  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty({ type: [Number], required: false })
  attachments?: number[];
}

export class UnitBatchDto {
  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  position?: number;

  @ApiProperty({ type: [AssignmentBatchDto], required: false })
  assignments?: AssignmentBatchDto[];
}

export class BatchUpdateCourseDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ type: [Number], required: false })
  teachers?: number[];

  @ApiProperty({ type: [UnitBatchDto], required: false })
  units?: UnitBatchDto[];
}

export class CourseResponseDto {
  id!: number;
  name!: string;
  description!: string;
  tenantId!: number;
  teachers!: number[];
  createdBy!: number;
  createdAt!: Date;
  updatedAt!: Date;
  courseUnits?: UnitSummaryDto[];
}

export class UnitSummaryDto {
  id!: number;
  title!: string;
  position!: number;
}

export class UnitDetailDto extends UnitSummaryDto {
  description!: string;
  assignments?: AssignmentSummaryDto[];
  courseMaterials?: MaterialSummaryDto[];
}

export class AssignmentSummaryDto {
  id!: number;
  title!: string;
  dueDate!: Date;
}

export class MaterialSummaryDto {
  id!: number;
  title!: string;
  fileId!: number;
}
