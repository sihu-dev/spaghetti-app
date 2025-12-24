import { Request, Response } from 'express';
import { createAssembly, findAssemblyById } from '../services/assembly.service';
import { AssemblyGenerationRequest } from '../types';
import { ApiError } from '../middleware/errorHandler';

export const generateAssembly = async (req: Request, res: Response): Promise<void> => {
  const { templateId, themeId, customizations }: AssemblyGenerationRequest = req.body;

  // Validation is now handled by middleware, but keep defensive check
  if (!templateId || !themeId) {
    throw ApiError.badRequest('templateId and themeId are required', 'MISSING_REQUIRED_FIELDS');
  }

  const assembly = await createAssembly({
    templateId,
    themeId,
    customizations
  });

  if (!assembly) {
    throw ApiError.internal('Failed to generate assembly', 'ASSEMBLY_GENERATION_FAILED');
  }

  res.status(201).json({
    success: true,
    data: assembly
  });
};

export const getAssembly = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest('Assembly ID is required', 'MISSING_ID');
  }

  const assembly = await findAssemblyById(id);

  if (!assembly) {
    throw ApiError.notFound(`Assembly with ID '${id}' not found`, 'ASSEMBLY_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: assembly
  });
};
