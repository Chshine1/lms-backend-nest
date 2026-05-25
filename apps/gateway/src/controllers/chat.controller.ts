import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import { ChatTypedClient } from '@app/typed-client/clients/chat.typed-client';

@Controller('/courses/:courseId')
export class ChatController{
    constructor(private readonly client: ChatTypedClient){}

    @Get('messages')
    getGroupMessages(
        @Param('courseId') courseId: string,
        @Param('before') before: string,
        @Param('limit') limit: number
    )
    {
        return this.client.getGroupMessages({courseId, before, limit});
    }

    @Get('messages/private')
    getPrivateMessages(
        @Param('courseId') courseId: string,
        @Param('before') before: string,
        @Param('limit') limit: number,
    )
    {
        return this.client.getPrivateMessages({courseId, before, limit});
    }

    @Get('messages/staff')
    getStaffMessages(
        @Param('courseId') courseId: string,
        @Param('before') before: string,
        @Param('limit') limit: number,
    )
    {
        return this.client.getStaffMessages({courseId, before, limit});
    }

    @Post('messages/:messageId/share')
    shareMessage(
        @Param('courseId') courseId: string,
        @Param('messageId') messageId: string,
    )
    {
        return this.client.shareMessages({courseId, messageId});
    }
}