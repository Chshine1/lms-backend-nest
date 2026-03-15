import { Expose } from 'class-transformer';

export class StaffContract {
  @Expose()
  userId!: number;

  @Expose()
  staffNo!: string;

  @Expose()
  staffRole!: string;

  @Expose()
  managedCampusIds!: number[];

  @Expose()
  managedStudentIds!: number[];
}
