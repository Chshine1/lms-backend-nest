import { Injectable } from '@nestjs/common';

import { StorageProviderType } from '@app/contracts';
import { FileStorageService } from '@app/infrastructure';
import { ISubmissionFileRepository } from '../../domain/repositories/index';
import { IAssignmentFileRepository } from '../../domain/repositories/index';
import { SubmissionFile } from '../../domain/entities/submission-file.entity';
import { AssignmentFile } from '../../domain/entities/assignment-file.entity';

export interface UploadFileData {
  fileName: string;
  fileSize: bigint;
  mimeType: string;
  buffer: Buffer;
}

export class FileDto {
  id!: bigint;
  fileKey!: string;
  fileName!: string;
  fileSize!: bigint;
  mimeType!: string;
  storageProvider!: string;
  uploadedAt!: Date;
  fileUrl!: string;
}

@Injectable()
export class FileApplicationService {
  constructor(
    private readonly fileStorage: FileStorageService,
    private readonly submissionFileRepository: ISubmissionFileRepository,
    private readonly assignmentFileRepository: IAssignmentFileRepository,
  ) {}

  async uploadSubmissionFile(
    submissionId: bigint,
    data: UploadFileData,
  ): Promise<FileDto> {
    const fileKey = await this.fileStorage.upload(data.buffer, {
      fileKey: '',
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
    });

    const submissionFile = new SubmissionFile();
    submissionFile.submissionId = submissionId;
    submissionFile.fileKey = fileKey;
    submissionFile.fileName = data.fileName;
    submissionFile.fileSize = data.fileSize;
    submissionFile.mimeType = data.mimeType;
    submissionFile.storageProvider = this.fileStorage.getProvider();
    submissionFile.uploadedAt = new Date();

    await this.submissionFileRepository.save(submissionFile);

    return this.mapToDto(submissionFile);
  }

  async uploadAssignmentFile(
    assignmentId: bigint,
    data: UploadFileData,
  ): Promise<FileDto> {
    const fileKey = await this.fileStorage.upload(data.buffer, {
      fileKey: '',
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
    });

    const assignmentFile = new AssignmentFile();
    assignmentFile.assignmentId = assignmentId;
    assignmentFile.fileKey = fileKey;
    assignmentFile.fileName = data.fileName;
    assignmentFile.fileSize = data.fileSize;
    assignmentFile.mimeType = data.mimeType;
    assignmentFile.storageProvider = this.fileStorage.getProvider();
    assignmentFile.uploadedAt = new Date();

    await this.assignmentFileRepository.save(assignmentFile);

    return this.mapToDto(assignmentFile);
  }

  async getSubmissionFiles(submissionId: bigint): Promise<FileDto[]> {
    const files =
      await this.submissionFileRepository.findBySubmissionId(submissionId);
    return Promise.all(files.map((f) => this.mapToDto(f)));
  }

  async getAssignmentFiles(assignmentId: bigint): Promise<FileDto[]> {
    const files =
      await this.assignmentFileRepository.findByAssignmentId(assignmentId);
    return Promise.all(files.map((f) => this.mapToDto(f)));
  }

  async getFileUrl(fileKey: string): Promise<string> {
    return this.fileStorage.getUrl(fileKey);
  }

  private async mapToDto(
    file: SubmissionFile | AssignmentFile,
  ): Promise<FileDto> {
    const dto = new FileDto();
    dto.id = file.id;
    dto.fileKey = file.fileKey;
    dto.fileName = file.fileName;
    dto.fileSize = file.fileSize;
    dto.mimeType = file.mimeType;
    dto.storageProvider = file.storageProvider;
    dto.uploadedAt = file.uploadedAt;
    dto.fileUrl = await this.fileStorage.getUrl(file.fileKey);
    return dto;
  }
}
