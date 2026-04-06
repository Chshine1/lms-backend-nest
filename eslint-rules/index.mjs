import { noDirectoryImport } from './no-directory-import.mjs';
import { noCrossServiceImport } from './no-cross-service-import.mjs';

export const customPlugin = {
  rules: {
    'no-directory-import': noDirectoryImport,
    'no-cross-service-import': noCrossServiceImport,
  },
};