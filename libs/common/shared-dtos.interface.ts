export interface SharedTenant {
  id: number;
  name: string;
  description?: string;
  subscriptionPlan?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SharedCreateTenantDto {
  name: string;
  description?: string;
  subscriptionPlan?: string;
}

export interface SharedUser {
  id: number;
  username: string;
  password: string;
  email: string;
  tenantId: number;
  roles: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SharedCreateUserDto {
  username: string;
  password: string;
  email: string;
  tenantId?: number;
}

export interface SharedValidateUserDto {
  username: string;
  password: string;
}
