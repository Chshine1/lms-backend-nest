export interface LoggerConfig {
  bootstrap: boolean;
  level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  prettyPrint?: boolean;
}
