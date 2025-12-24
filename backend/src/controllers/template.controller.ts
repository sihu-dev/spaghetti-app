import { Request, Response } from 'express';
import { getAllTemplates, getTemplateDetails } from '../services/template.service';

export const getTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;

    const templates = await getAllTemplates(category as string);

    res.status(200).json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      error: 'Failed to get templates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const template = await getTemplateDetails(id);

    if (!template) {
      res.status(404).json({
        error: 'Template not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      error: 'Failed to get template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
