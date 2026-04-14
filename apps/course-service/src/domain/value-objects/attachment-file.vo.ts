export class AttachmentFile {
  constructor(
    public readonly fileKey: string,
    public readonly fileName: string,
    public readonly sizeBytes: bigint,
  ) {
    if (sizeBytes <= 0n) {
      throw new Error('File size must be a positive integer');
    }
  }

  getDownloadUrl(): string {
    return `/storage/${this.fileKey}`;
  }
}
