import path from 'path';

export const noCrossServiceImport = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid cross-service imports.',
      category: 'Errors',
      recommended: true,
    },
    messages: {
      crossServiceImport: 'Cross-service import is forbidden: From "{{targetService}}" to "{{currentService}}".',
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    const currentService = extractServiceName(filename);
    if (!currentService) {
      return {};
    }
    
    function checkImportPath(node, importPath) {
      if (!importPath || typeof importPath !== 'string') return;
      
      if (!importPath.startsWith('@/')) return;
      
      const match = importPath.match(/^@\/([^/]+)/);
      if (!match) {
        context.report({
          node,
          message: `Unstandardized absolute import "${importPath}"`,
        });
        return;
      }
      
      const targetService = match[1];
      if (targetService !== currentService) {
        context.report({
          node,
          messageId: 'crossServiceImport',
          data: {
            targetService,
            currentService,
          },
        });
      }
    }
    
    return {
      ImportDeclaration(node) {
        checkImportPath(node, node.source.value);
      },
      ExportNamedDeclaration(node) {
        if (node.source) {
          checkImportPath(node, node.source.value);
        }
      },
    };
  },
};

function extractServiceName(filepath) {
  const normalized = path.normalize(filepath).replace(/\\/g, '/');
  const appsIndex = normalized.indexOf('/apps/');
  if (appsIndex === -1) return null;
  const afterApps = normalized.slice(appsIndex + 6);
  const firstSlash = afterApps.indexOf('/');
  if (firstSlash === -1) return null;
  return afterApps.slice(0, firstSlash);
}