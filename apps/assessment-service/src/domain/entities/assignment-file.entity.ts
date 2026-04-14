import { defineEntity, p } from '@mikro-orm/core';
import { BaseEntitySchema } from '@app/contracts';

const AssignmentFileSchema = defineEntity({
  name: 'AssignmentFile',
  extends: BaseEntitySchema,
  tableName: 'assignment_files',
  properties: {
    assignmentId: p.bigint(),
    fileKey: p.string().length(512),
    fileName: p.string().length(255),
    fileSize: p.bigint(),
    mimeType: p.string().length(100),
    storageProvider: p.string().length(20),
    uploadedAt: p.datetime().onUpdate(() => new Date()),
  },
  indexes: [
    {
      name: 'assignment_file_assignment_id_idx',
      properties: ['assignmentId'],
    },
  ],
});

export class AssignmentFile extends AssignmentFileSchema.class {
  getFileUrl(): string {
    return `/files/assignment/${this.fileKey}`;
  }
}

AssignmentFileSchema.setClass(AssignmentFile);
