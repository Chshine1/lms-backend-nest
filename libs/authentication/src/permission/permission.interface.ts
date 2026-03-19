export interface Permission {
  userId: number;
  resource: number;
  action: number;
  createdAt: Date;
  deletedAt?: Date;
}
