export interface ChatAttachmentPatterns extends Record<
string,
{request: unknown, response: unknown}>
{
    'attach.upload-attachment':{
        request:{
            courseId: string;
            fileName: string;
            fileContent: string; // base64 encoded file bytes
            mimeType: string;
            sizeBytes: number;
        };

        response:{
            fileId: string;
            fileName: string;
            mimeType: string;
            sizeBytes: number;

        }
    }
}