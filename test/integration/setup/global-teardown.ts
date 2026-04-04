import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { DockerComposeEnvironment } from 'testcontainers';

const STATE_FILE = path.join(os.tmpdir(), 'lms-integration-state.json');

declare global {
  // noinspection ES6ConvertVarToLetConst,JSUnusedGlobalSymbols
  var __COMPOSE_ENV__:
    | Awaited<ReturnType<DockerComposeEnvironment['up']>>
    | undefined;
}

export default async function globalTeardown(): Promise<void> {
  console.log('\n[integration] Tearing down docker-compose stack…');

  if (global.__COMPOSE_ENV__ !== undefined) {
    // Stop and remove containers; volumes are tmpfs in the compose file so data
    // is already ephemeral — removeVolumes is just for cleanup hygiene.
    await global.__COMPOSE_ENV__.down({ removeVolumes: true });
    console.log('[integration] Stack stopped.');
  } else {
    console.warn(
      '[integration] No compose environment found on global — nothing to stop.',
    );
  }

  if (fs.existsSync(STATE_FILE)) {
    fs.unlinkSync(STATE_FILE);
  }
}
