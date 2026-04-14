export type ContentBlock =
  | { type: 'text'; data: { content: string } }
  | {
      type: 'choice';
      data: { question: string; options: string[]; correctIndex?: number };
    }
  | {
      type: 'fillBlank';
      data: { question: string; correctAnswers?: string[] };
    };

export class AssignmentContent {
  constructor(public readonly blocks: ContentBlock[]) {
    if (blocks.length === 0) {
      throw new Error('Assignment content must have at least one block');
    }
  }

  getTotalProblems(): number {
    return this.blocks.length;
  }
}
