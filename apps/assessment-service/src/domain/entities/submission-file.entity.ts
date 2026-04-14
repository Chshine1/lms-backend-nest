import { defineEntity, p } from '@mikro-orm/core';
import { BaseEntitySchema } from '@app/contracts';

const SubmissionFileSchema = defineEntity({
  name: 'SubmissionFile',
  extends: BaseEntitySchema,
  tableName: 'submission_files',
  properties: {
    submissionId: p.bigint(),
    fileKey: p.string().length(512),
    fileName: p.string().length(255),
    fileSize: p.bigint(),
    mimeType: p.string().length(100),
    storageProvider: p.string().length(20),
    uploadedAt: p.datetime().onUpdate(() => new Date()),
  },
  indexes: [
    {
      name: 'submission_file_submission_id_idx',
      properties: ['submissionId'],
    },
  ],
});

export class SubmissionFile extends SubmissionFileSchema.class {
  getFileUrl(): string {
    return `/files/submission/${this.fileKey}`;
  }
}

SubmissionFileSchema.setClass(SubmissionFile);
