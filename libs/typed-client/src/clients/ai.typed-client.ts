import { TypedClientBase } from "../typed-client.base";
import { AiPatterns } from "../patterns/ai.patterns";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { UserContextService } from "@app/authentication";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AiTypedClient extends TypedClientBase<AiPatterns> {
    constructor(
        amqpConnection: AmqpConnection,
        userContextService: UserContextService,
        options: {exchange: string}

    ){
        super('ai-service', amqpConnection, userContextService, options);
    }

    query(data: AiPatterns['ai.query']['request'],): Promise<AiPatterns['ai.query']['response']>{
        return this.rpc('ai.query', data);
    }

    mention(data: AiPatterns['ai.mention']['request'], ): Promise<AiPatterns['ai.mention']['response']>{
        return this.rpc('ai.mention', data);
    }

    master(data: AiPatterns['ai.master']['request'], ): Promise<AiPatterns['ai.master']['response']>{
        return this.rpc('ai.master', data);
    }

    
    staff(data: AiPatterns['ai.staff']['request'], ): Promise<AiPatterns['ai.staff']['response']>{
        return this.rpc('ai.staff', data);
    }

    attr_clarification(data: AiPatterns['ai.attribute-clarification']['request'], ): Promise<AiPatterns['ai.attribute-clarification']['response']>{
        return this.rpc('ai.attribute-clarification', data);
    }


}