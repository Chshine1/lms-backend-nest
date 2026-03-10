export interface LogEntry {
  timestamp: Date;
  message: string;
  [key: string]: unknown;
}
