import { Assembly, AssemblyGenerationRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getTemplateDetails } from './template.service';

// In-memory storage (replace with database in production)
const assemblies = new Map<string, Assembly>();

const generateReactCode = (templateId: string, themeId: string, customizations?: Record<string, unknown>): string => {
  // TODO: Implement actual code generation logic
  const backgroundColor = typeof customizations?.backgroundColor === 'string' ? customizations.backgroundColor : '#FFFFFF';
  const padding = typeof customizations?.padding === 'string' ? customizations.padding : '16px';
  const borderRadius = typeof customizations?.borderRadius === 'string' ? customizations.borderRadius : '8px';

  return `
import React from 'react';

const Component = () => {
  return (
    <div style={{
      backgroundColor: '${backgroundColor}',
      padding: '${padding}',
      borderRadius: '${borderRadius}'
    }}>
      {/* Generated component for template: ${templateId} with theme: ${themeId} */}
      <h1>Generated Component</h1>
    </div>
  );
};

export default Component;
  `.trim();
};

export const createAssembly = (
  request: AssemblyGenerationRequest
): Assembly => {
  const { templateId, themeId, customizations } = request;

  // Validate template exists
  const template = getTemplateDetails(templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  const generatedCode = generateReactCode(templateId, themeId, customizations);

  const assembly: Assembly = {
    id: uuidv4(),
    templateId,
    themeId,
    customizations,
    generatedCode,
    createdAt: new Date().toISOString()
  };

  assemblies.set(assembly.id, assembly);

  return assembly;
};

export const findAssemblyById = (id: string): Assembly | null => {
  return assemblies.get(id) || null;
};

export const getAllAssemblies = (): Assembly[] => {
  return Array.from(assemblies.values());
};
