export class CourseDto {
  id!: bigint;
  name!: string;
  code!: string;
  description!: string;
  teachers!: bigint[];
  createdAt!: Date;
  updatedAt!: Date;
}
