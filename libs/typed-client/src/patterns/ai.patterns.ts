export interface AiPatterns extends Record<
string, 
{request: unknown, response: unknown}
> {
    'ai.query':{
        request: {
            courseId: string,
            body: string
        };
        response: {answer: string, citation: string};
    };

    'ai.mention':{
        request: {
            courseId: string,
            body: string
        };
        response: {answer: string, citation: string};
    };

    'ai.master':{
        request: {
            courseId: string,
            body: string
        };
        response: {answer: string};
    };

    'ai.staff':{
        request: {
            courseId: string,
            body: string
        };
        response: {answer: string};
    };

    'ai.attribute-clarification':{
        request: {
            courseId: string,
            requestId: string,
            body: string
        };
        response: {result: string};
    };

}