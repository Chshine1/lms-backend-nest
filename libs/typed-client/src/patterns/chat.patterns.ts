export interface ChatPatterns extends Record<
string,
{request: unknown, response: unknown}>
{
    'chat.get-group-messages':{
        request:{
            courseId: string,
            before?: string,
            limit: number
        };

        response:{
            id: string;
            channelType: string;
            senderId: string | null;
            senderDisplay: string;
            content: string;
            assignmentId: string | null;
            sharedToGroup: boolean;
            sharedByDisplay: string | null;
            uploadedFileId: string | null;
            uploadedFileName: string | null;
            actions: Record<string, unknown>[] | null;
            createdAt: string;
        }[];
    };

    'chat.get-private-messages':{
        request:{
            courseId: string;
            before?: string;
            limit: number;
        };

        response:{
            id: number;
            channelType: string;
            senderId: number | null;
            senderContent: string;
            assignmentId: number | null;
            sharedToGroup: boolean;
            uploadedFileId: string | null;
            uploadedFileName: string | null;
            actions: Record<string, unknown>[] | null;
            createdAt: string;
        }[];
    };

    'chat.get-staff-messages':{
        request:{
            courseId: string;
            before?: string;
            limit?: number;
        };

        response:{
            id: number;
            channelType: string;
            senderId: number | null;
            senderContent: string;
            assignmentId: number | null;
            sharedToGroup: boolean;
            uploadedFileId: string | null;
            uploadedFileName: string | null;
            actions: Record<string, unknown>[] | null;
            createdAt: string;
        }[];
    };

    'chat.share-message':{

        request:{
            courseId: string;
            messageId: string;
        };

        response:{
            detail: string;
            sharedMessageId: string;
        };

    };

}