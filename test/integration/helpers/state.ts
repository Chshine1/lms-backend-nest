import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export interface IntegrationState {
  gatewayUrl: string;
  userServiceUrl: string;
  courseServiceUrl: string;
  assignmentServiceUrl: string;
  enrollmentServiceUrl: string;
  schedulingServiceUrl: string;
  fileServiceUrl: string;
  pgHost: string;
  pgPort: number;
  pgUser: string;
  pgPassword: string;
  pgDatabase: string;
  rabbitmqMgmtUrl: string;
  lokiUrl: string;
  seed: {
    adminUserId: number;
    adminUsername: string;
    adminPassword: string;
    tenantId: number;
    courseId: number;
    courseUnitId: number;
    assignmentId: number;
  };
}

const DEFAULT_STATE_FILE = path.join(os.tmpdir(), 'lms-integration-state.json');

export function loadState(): IntegrationState {
  const stateFile = process.env['INTEGRATION_STATE_FILE'] ?? DEFAULT_STATE_FILE;
  if (!fs.existsSync(stateFile)) {
    throw new Error(
      `Integration state file not found at ${stateFile}. ` +
        'Did global-setup run? Make sure you run tests via the integration jest config.',
    );
  }
  return JSON.parse(fs.readFileSync(stateFile, 'utf-8')) as IntegrationState;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
