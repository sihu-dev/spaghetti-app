# Error Handling Documentation

This document describes the error handling system implemented in the SPAGHETTI backend API.

## Overview

The backend now includes a comprehensive error handling system that ensures all errors return consistent JSON responses with proper HTTP status codes.

## Error Response Format

All errors return the following JSON format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE_CONSTANT",
  "statusCode": 400
}
```

## Components

### 1. ApiError Class (`/home/user/spaghetti-app/backend/src/middleware/errorHandler.ts`)

Custom error class with convenient static methods for common HTTP errors:

```typescript
// 400 Bad Request
throw ApiError.badRequest('Invalid input', 'INVALID_INPUT');

// 401 Unauthorized
throw ApiError.unauthorized('Authentication required', 'AUTH_REQUIRED');

// 403 Forbidden
throw ApiError.forbidden('Access denied', 'ACCESS_DENIED');

// 404 Not Found
throw ApiError.notFound('Resource not found', 'RESOURCE_NOT_FOUND');

// 422 Validation Error
throw ApiError.validationError('Invalid data format', 'VALIDATION_ERROR');

// 500 Internal Server Error
throw ApiError.internal('Something went wrong', 'INTERNAL_ERROR');
```

### 2. Async Handler Wrapper

Wraps async route handlers to automatically catch and forward errors to the error handler:

```typescript
import { asyncHandler } from '../middleware/errorHandler';

// In routes
router.post('/endpoint', asyncHandler(myController));
```

### 3. Global Error Handler

Catches all errors and formats them consistently. Handles:
- Custom `ApiError` instances
- Validation errors
- Multer file upload errors
- Generic JavaScript errors

### 4. 404 Not Found Handler

Automatically handles requests to undefined routes.

## Request Validation (`/home/user/spaghetti-app/backend/src/middleware/validator.ts`)

### Available Validators

#### validateThemeExtraction
Validates theme extraction requests:
- Ensures image file or URL is provided
- Validates URL format
- Checks file type (JPEG, PNG, GIF, WebP)
- Enforces 10MB file size limit

**Error Codes:**
- `MISSING_IMAGE_INPUT`: No image file or URL provided
- `INVALID_IMAGE_URL`: Invalid URL format or protocol
- `INVALID_IMAGE_FORMAT`: Unsupported image format
- `FILE_TOO_LARGE`: File exceeds 10MB limit

#### validateAssemblyGeneration
Validates assembly generation requests:
- Requires `templateId` and `themeId`
- Validates customizations object structure

**Error Codes:**
- `MISSING_TEMPLATE_ID`: templateId is missing
- `MISSING_THEME_ID`: themeId is missing
- `INVALID_TEMPLATE_ID`: templateId format is invalid
- `INVALID_THEME_ID`: themeId format is invalid
- `INVALID_CUSTOMIZATIONS`: customizations format is invalid

#### validateIdParam
Validates ID parameters in route paths:
- Ensures ID is present and non-empty

**Error Codes:**
- `MISSING_ID_PARAM`: ID parameter is missing
- `INVALID_ID_PARAM`: ID parameter format is invalid

#### validateTemplateQuery
Validates query parameters for template filtering:
- Validates category against allowed values
- Validates limit (1-100)
- Validates offset (>= 0)

**Error Codes:**
- `INVALID_CATEGORY`: Invalid category value
- `INVALID_LIMIT`: Limit out of range
- `INVALID_OFFSET`: Offset is negative

## Usage Examples

### In Controllers

Controllers now throw errors instead of manually sending responses:

```typescript
import { ApiError } from '../middleware/errorHandler';

export const myController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest('ID is required', 'MISSING_ID');
  }

  const result = await myService.findById(id);

  if (!result) {
    throw ApiError.notFound(`Resource with ID '${id}' not found`, 'RESOURCE_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: result
  });
};
```

### In Routes

Routes use `asyncHandler` and validation middleware:

```typescript
import { asyncHandler } from '../middleware/errorHandler';
import { validateIdParam } from '../middleware/validator';

router.get(
  '/:id',
  asyncHandler(validateIdParam()),
  asyncHandler(myController)
);
```

### In Main App

The error handlers are registered after all routes:

```typescript
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// ... routes ...

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);
```

## API Routes with Error Handling

All routes now include proper error handling:

### Theme Routes
- `POST /api/theme/extract` - Extract theme from image
  - Validates: Image file or URL required
  - Returns: Theme object or error

### Assembly Routes
- `POST /api/assembly/generate` - Generate assembly
  - Validates: templateId and themeId required
  - Returns: Assembly object or error
- `GET /api/assembly/:id` - Get assembly by ID
  - Validates: ID parameter
  - Returns: Assembly object or 404 error

### Template Routes
- `GET /api/templates` - Get all templates
  - Validates: Query parameters (category, limit, offset)
  - Returns: Template array or error
- `GET /api/templates/:id` - Get template by ID
  - Validates: ID parameter
  - Returns: Template object or 404 error

## Error Logging

The error handler logs errors differently based on severity:

- **5xx errors**: Full error details including stack trace
- **4xx errors**: Warning with basic error information

Example error log (500):
```json
{
  "message": "Database connection failed",
  "stack": "Error: Database connection failed\n    at ...",
  "code": "INTERNAL_ERROR",
  "statusCode": 500,
  "path": "/api/assembly/generate",
  "method": "POST",
  "timestamp": "2025-12-24T10:30:00.000Z"
}
```

Example error log (400):
```json
{
  "message": "Invalid input",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "path": "/api/theme/extract",
  "method": "POST"
}
```

## Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `BAD_REQUEST` | 400 | Generic bad request |
| `MISSING_IMAGE_INPUT` | 400 | No image provided |
| `INVALID_IMAGE_URL` | 400 | Invalid image URL |
| `INVALID_IMAGE_FORMAT` | 400 | Unsupported image format |
| `FILE_TOO_LARGE` | 400 | File exceeds size limit |
| `MISSING_TEMPLATE_ID` | 400 | templateId missing |
| `MISSING_THEME_ID` | 400 | themeId missing |
| `MISSING_ID` | 400 | ID parameter missing |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `ASSEMBLY_NOT_FOUND` | 404 | Assembly not found |
| `TEMPLATE_NOT_FOUND` | 404 | Template not found |
| `ROUTE_NOT_FOUND` | 404 | API route not found |
| `VALIDATION_ERROR` | 422 | Data validation failed |
| `INTERNAL_ERROR` | 500 | Server error |
| `THEME_EXTRACTION_FAILED` | 500 | Theme extraction failed |
| `ASSEMBLY_GENERATION_FAILED` | 500 | Assembly generation failed |

## Testing Error Handling

### Test with cURL

```bash
# Test 404 - Route not found
curl http://localhost:3000/api/invalid

# Test 400 - Missing required field
curl -X POST http://localhost:3000/api/theme/extract \
  -H "Content-Type: application/json"

# Test 404 - Resource not found
curl http://localhost:3000/api/templates/nonexistent-id

# Test 400 - Invalid validation
curl -X POST http://localhost:3000/api/assembly/generate \
  -H "Content-Type: application/json" \
  -d '{"templateId": ""}'
```

### Expected Responses

```json
// 404 Route Not Found
{
  "success": false,
  "error": "Route GET /api/invalid not found",
  "code": "ROUTE_NOT_FOUND",
  "statusCode": 404
}

// 400 Missing Image
{
  "success": false,
  "error": "Image file or URL is required",
  "code": "MISSING_IMAGE_INPUT",
  "statusCode": 400
}

// 404 Resource Not Found
{
  "success": false,
  "error": "Template with ID 'nonexistent-id' not found",
  "code": "TEMPLATE_NOT_FOUND",
  "statusCode": 404
}
```

## Best Practices

1. **Always use ApiError for known errors**: Use the static methods for common HTTP errors
2. **Wrap async handlers**: Always use `asyncHandler` in routes
3. **Add validation middleware**: Use validators before controller handlers
4. **Throw, don't return**: Throw errors instead of manually sending error responses
5. **Provide specific error codes**: Use descriptive error codes for better debugging
6. **Include context in messages**: Make error messages helpful for debugging

## Migration from Old Error Handling

### Before
```typescript
export const myController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body.id) {
      res.status(400).json({ error: 'ID required' });
      return;
    }

    const result = await myService.find(req.body.id);

    if (!result) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### After
```typescript
export const myController = async (req: Request, res: Response): Promise<void> => {
  if (!req.body.id) {
    throw ApiError.badRequest('ID is required', 'MISSING_ID');
  }

  const result = await myService.find(req.body.id);

  if (!result) {
    throw ApiError.notFound('Resource not found', 'RESOURCE_NOT_FOUND');
  }

  res.json({ success: true, data: result });
};
```

## Files Modified

- `/home/user/spaghetti-app/backend/src/middleware/errorHandler.ts` - Created
- `/home/user/spaghetti-app/backend/src/middleware/validator.ts` - Created
- `/home/user/spaghetti-app/backend/src/index.ts` - Updated
- `/home/user/spaghetti-app/backend/src/controllers/theme.controller.ts` - Updated
- `/home/user/spaghetti-app/backend/src/controllers/assembly.controller.ts` - Updated
- `/home/user/spaghetti-app/backend/src/controllers/template.controller.ts` - Updated
- `/home/user/spaghetti-app/backend/src/routes/theme.routes.ts` - Updated
- `/home/user/spaghetti-app/backend/src/routes/assembly.routes.ts` - Updated
- `/home/user/spaghetti-app/backend/src/routes/template.routes.ts` - Updated
