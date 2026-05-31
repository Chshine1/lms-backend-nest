import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { ChatAttachmentPatterns } from "../patterns/chat-attachments.patterns";
import { TypedClientBase } from "../typed-client.base";
import { UserContextService } from "@app/authentication";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ChatAttachmentTypedClient extends TypedClientBase<ChatAttachmentPatterns>{
    constructor(
        amqpConnection: AmqpConnection,
        userContextService: UserContextService,
        options: {exchange: string}

    ){
        super('chatAttachment-service', amqpConnection, userContextService, options);
    }

    attachments(data: ChatAttachmentPatterns['attach.upload-attachment']['request'],): Promise<ChatAttachmentPatterns['attach.upload-attachment']['response']>{
        return this.rpc('attach.upload-attachment', data);
    }
}