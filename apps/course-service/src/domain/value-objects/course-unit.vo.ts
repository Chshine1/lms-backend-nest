export class CourseUnit {
  constructor(
    public readonly name: string,
    public readonly description: string,
  ) {
    if (name.length < 1 || name.length > 100) {
      throw new Error('Unit name must be 1-100 characters');
    }
    if (description.length > 5000) {
      throw new Error('Unit description must be at most 5000 characters');
    }
  }

  updateContent(description: string): void {
    if (description.length > 5000) {
      throw new Error('Unit description must be at most 5000 characters');
    }
  }
}
