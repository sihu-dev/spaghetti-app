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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
