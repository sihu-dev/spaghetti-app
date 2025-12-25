import { Request, Response } from 'express';
import { createAssembly, findAssemblyById } from '../services/assembly.service';
import { AssemblyGenerationRequest } from '../types';

export const generateAssembly = (req: Request, res: Response): void => {
  try {
    const { templateId, themeId, customizations } = req.body as AssemblyGenerationRequest;

    if (!templateId || !themeId) {
      res.status(400).json({
        error: 'templateId and themeId are required'
      });
      return;
    }

    const assembly = createAssembly({
      templateId,
      themeId,
      customizations
    });

    res.status(201).json({
      success: true,
      data: assembly
    });
  } catch (error) {
    console.error('Assembly generation error:', error);
    res.status(500).json({
      error: 'Failed to generate assembly',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAssembly = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const assembly = findAssemblyById(id);

    if (!assembly) {
      res.status(404).json({
        error: 'Assembly not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: assembly
    });
  } catch (error) {
    console.error('Get assembly error:', error);
    res.status(500).json({
      error: 'Failed to get assembly',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
