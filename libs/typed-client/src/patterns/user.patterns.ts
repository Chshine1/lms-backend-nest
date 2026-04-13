export interface UserPatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'user.register': {
    request: {
      email: string;
      password: string;
      phoneNumber?: string;
      invitationCode?: string;
    };
    response: {
      id: number;
      tenantId: number;
      email: string;
      phoneNumber?: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    };
  };
  'user.find-by-id': {
    request: {
      userId: number;
    };
    response: {
      id: number;
      tenantId: number;
      email: string;
      phoneNumber?: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  };
  'user.assign-role': {
    request: {
      adminUserId: number;
      targetUserId: number;
      roleId: number;
    };
    response: void;
  };
  'user.link-parent-student': {
    request: {
      parentUserId: number;
      studentUserId: number;
    };
    response: void;
  };
  'user.complete-onboarding': {
    request: {
      studentUserId: number;
      signatureData?: Record<string, unknown>;
    };
    response: void;
  };
}
