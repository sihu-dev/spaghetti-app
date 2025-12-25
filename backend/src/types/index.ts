import { Request } from 'express';

export interface Theme {
  colors: string[];
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  surface?: string;
  text?: string;
  mood?: string;
  suggestion?: string;
  createdAt?: string;
  id?: number;
  savedAt?: string;
}

export interface ThemeRequest {
  imageFile?: Express.Multer.File;
  imageUrl?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  previewImage: string;
  componentType: string;
  props: Record<string, any>;
  createdAt: Date;
}

export interface Assembly {
  id: string;
  templateId: string;
  themeId: string;
  customizations?: Record<string, any>;
  generatedCode: string;
  createdAt: Date;
}

export interface AssemblyGenerationRequest {
  templateId: string;
  themeId: string;
  customizations?: Record<string, any>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  expiresIn: string;
}
