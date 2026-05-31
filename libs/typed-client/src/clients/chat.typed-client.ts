import { Injectable } from "@nestjs/common";
import { ChatPatterns } from "../patterns/chat.patterns";
import { TypedClientBase } from "../typed-client.base";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import {UserContextService} from "@app/authentication";

@Injectable()
export class ChatTypedClient extends TypedClientBase<ChatPatterns>{
    constructor(
        amqpConnection: AmqpConnection,
        userContextService: UserContextService,
        options:{exchange: string;}
    ) {
        super('chat-service', amqpConnection, userContextService, options);
    }

    getGroupMessages(data: ChatPatterns['chat.get-group-messages']['request'],):Promise<ChatPatterns['chat.get-group-messages']['response']>{
        return this.rpc('chat.get-group-messages', data);
    }

    getPrivateMessages(data: ChatPatterns['chat.get-private-messages']['request'],):Promise<ChatPatterns['chat.get-private-messages']['response']>{
        return this.rpc('chat.get-private-messages', data);
    }

    shareMessages(data: ChatPatterns['chat.share-message']['request'],):Promise<ChatPatterns['chat.share-message']['response']>{
        return this.rpc('chat.share-message', data);
    }

    getStaffMessages(data: ChatPatterns['chat.get-staff-messages']['request'],):Promise<ChatPatterns['chat.get-staff-messages']['response']>{
        return this.rpc('chat.get-staff-messages', data);
    }

}