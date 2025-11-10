// Type definitions based on C# models

export interface AuditLog {
  schemaName: string;
  tableName: string;
  keyValue: number;
  changedByUser: number | null;
  userName: string;
  changeDate: string; // ISO date string
  changeType: string;
  diffJson: string;
  diffText: string;
}

export interface User {
  userId: number;
  fullName: string;
}

export interface AuditSearchRequest {
  userId: number;
  fromDate: string;
  toDate: string;
  page: number;
  pageSize: number;
}

export interface AuditSearchResponse {
  items?: AuditLog[];
  totalCount?: number;
}

export interface UserSearchRequest {
  data: string;
}
