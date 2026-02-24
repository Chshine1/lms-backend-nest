import { ValidationError } from 'class-validator';

export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors
    .map((error) => {
      if (error.constraints) {
        return Object.values(error.constraints).join(', ');
      }
      if (error.children && error.children.length > 0) {
        return formatValidationErrors(error.children);
      }
      return 'Unknown validation error';
    })
    .join('; ');
};
