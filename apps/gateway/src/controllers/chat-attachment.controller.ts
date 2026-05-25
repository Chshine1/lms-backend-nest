import { ChatAttachmentTypedClient } from "@app/typed-client/clients/chat-attachment.typed-client";
import { Controller, Param, Post, UseInterceptors } from "@nestjs/common";
import {FileInterceptor} from '@nestjs/platform-express';


@Controller('course/:courseId/chat')
export class ChatAttachmentController {
    constructor(private readonly client: ChatAttachmentTypedClient){}

    @Post('attachments')
    @UseInterceptors(FileInterceptor('file'))
    uploadAttachment(
        @Param('courseId') courseId: string,
        @Param('filename') fileName: string,
        @Param('fileContent') fileContent: string,
        @Param('mimeType') mimeType: string,
        @Param('sizeBytes') sizeBytes: number
    )
    {
        return this.client.attachments({courseId, fileName, fileContent, mimeType, sizeBytes});
    }

}