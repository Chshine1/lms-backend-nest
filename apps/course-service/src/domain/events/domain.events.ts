export class CourseCreatedEvent {
  constructor(
    public readonly courseId: bigint,
    public readonly name: string,
    public readonly code: string,
    public readonly teacherIds: bigint[],
  ) {}
}

export class StudentEnrolledEvent {
  constructor(
    public readonly enrollmentId: bigint,
    public readonly studentId: bigint,
    public readonly courseId: bigint,
  ) {}
}

export class TeacherAssignedToCourseEvent {
  constructor(
    public readonly courseId: bigint,
    public readonly teacherId: bigint,
  ) {}
}
