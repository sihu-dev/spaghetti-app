import { Request, Response } from 'express';
import { getAllTemplates, getTemplateDetails } from '../services/template.service';
import { ApiError } from '../middleware/errorHandler';

export const getTemplates = async (req: Request, res: Response): Promise<void> => {
  const { category } = req.query;

  const templates = await getAllTemplates(category as string);

  if (!templates) {
    throw ApiError.internal('Failed to retrieve templates', 'TEMPLATES_RETRIEVAL_FAILED');
  }

  res.status(200).json({
    success: true,
    data: templates,
    count: templates.length
  });
};

export const getTemplateById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest('Template ID is required', 'MISSING_ID');
  }

  const template = await getTemplateDetails(id);

  if (!template) {
    throw ApiError.notFound(`Template with ID '${id}' not found`, 'TEMPLATE_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: template
  });
};
