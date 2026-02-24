export interface LoggerConfig {
  level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  prettyPrint?: boolean;
  redact?: string[];
  baseFields?: Record<string, unknown>;
}
