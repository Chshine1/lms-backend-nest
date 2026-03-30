import { ApiProperty } from '@nestjs/swagger';

export class AssignmentBatchDto {
  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  dueDate?: Date;
}

export class CourseUnitBatchDto {
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

  @ApiProperty({ type: [CourseUnitBatchDto], required: false })
  units?: CourseUnitBatchDto[];
}
