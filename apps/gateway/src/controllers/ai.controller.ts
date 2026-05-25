import { AiTypedClient } from "@app/typed-client";
import { Body, Controller, Post } from "@nestjs/common";


@Controller('ai')
export class AiController{
    constructor(private readonly aiClient: AiTypedClient){}

    @Post('query')
    async query(@Body() body: {courseId: string, body: string}){
        return this.aiClient.query({
            body: body.body,
            courseId: body.courseId
        });
}

    @Post('mention')
    async mention(@Body() body: {courseId: string, body: string}){
        return this.aiClient.mention({
            body: body.body,
            courseId: body.courseId
        });
}

    @Post('master')
    async master(@Body() body: {courseId: string, body: string}){
        return this.aiClient.master({
            body: body.body,
            courseId: body.courseId
        });
}

    @Post('staff')
    async staff(@Body() body: {courseId: string, body: string}){
        return this.aiClient.staff({
            body: body.body,
            courseId: body.courseId
        });
}

    @Post('attribute-clarification')
    async resolve_attribute(@Body() body: {courseId: string, body: string, requestId: string}){
        return this.aiClient.attr_clarification({
            body: body.body,
            courseId: body.courseId,
            requestId: body.requestId
        });
}


}