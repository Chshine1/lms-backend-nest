import { BaseError, IdentityType, UserContract } from '@app/contracts';
import { CourseErrorCode } from '@/course-service/src/course-error.code';

type ValidateTeacherError = {
  id: number;
} & ({ type: 'not-found' } | { type: 'not-teacher'; identity: IdentityType });

export class InvalidTeachersError extends BaseError<{
  teacherIds: number[];
  validateTeacherErrors: ValidateTeacherError[];
}> {
  constructor(teacherIds: number[], users: (UserContract | undefined)[]) {
    let notFoundIds = '';
    let notTeacherIds = '';

    const validateTeacherErrors: ValidateTeacherError[] = users
      .map((u, index): ValidateTeacherError | undefined => {
        const id = teacherIds[index];
        if (id === undefined) return undefined;

        if (u === undefined) return { id: id, type: 'not-found' };
        if (u.identityType !== IdentityType.TEACHER)
          return { id: id, type: 'not-teacher', identity: u.identityType };

        return undefined;
      })
      .filter((e) => e !== undefined);

    for (const err of validateTeacherErrors) {
      if (err.type === 'not-found') notFoundIds += `${String(err.id)}, `;
      else notTeacherIds += `${String(err.id)}, `;
    }

    let message = 'Invalid teachers for a course:';
    if (notFoundIds.length > 0) {
      message += ` [${notFoundIds.substring(0, notFoundIds.length - 2)}] are not found.`;
    }
    if (notTeacherIds.length > 0) {
      message += ` [${notTeacherIds.substring(0, notTeacherIds.length - 2)}] are not teachers.`;
    }

    super(message, CourseErrorCode.COURSE_INVALID_TEACHERS, {
      teacherIds,
      validateTeacherErrors,
    });
  }
}
