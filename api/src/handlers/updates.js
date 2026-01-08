import { queryUpdates } from '../lib/cosmosClient.js';
import { 
  validateLimit, 
  validateCategory, 
  sanitizeError,
  createSuccessResponse,
  createErrorResponse,
  getOriginFromRequest
} from '../lib/security.js';

export async function getUpdates(request, context) {
  const origin = getOriginFromRequest(request);
  
  try {
    const url = new URL(request.url);
    const categoryParam = url.searchParams.get('category');
    const limitParam = url.searchParams.get('limit');
    
    // Validate and sanitize inputs
    const category = validateCategory(categoryParam);
    const limit = validateLimit(limitParam, 50, 1000);
    
    let querySpec = {
      query: 'SELECT * FROM c ORDER BY c.publishedDate DESC',
      parameters: []
    };

    if (category) {
      querySpec = {
        query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.categories, @category) ORDER BY c.publishedDate DESC',
        parameters: [{ name: '@category', value: category }]
      };
    }

    const updates = await queryUpdates(querySpec, limit);

    return createSuccessResponse(updates, origin);
  } catch (error) {
    context.error('Error fetching updates:', sanitizeError(error));
    return createErrorResponse(500, 'Failed to fetch updates', origin);
  }
}

export async function getCategories(request, context) {
  const origin = getOriginFromRequest(request);
  
  try {
    const querySpec = {
      query: 'SELECT DISTINCT VALUE c FROM u JOIN c IN u.categories'
    };

    const categories = await queryUpdates(querySpec, 100);

    return createSuccessResponse(categories, origin);
  } catch (error) {
    context.error('Error fetching categories:', sanitizeError(error));
    return createErrorResponse(500, 'Failed to fetch categories', origin);
  }
}

export async function getUpdatesByCategory(request, context) {
  const origin = getOriginFromRequest(request);
  
  try {
    const categoryParam = request.params.category;
    const limitParam = new URL(request.url).searchParams.get('limit');
    
    // Validate and sanitize inputs
    const category = validateCategory(categoryParam);
    const limit = validateLimit(limitParam, 50, 1000);
    
    if (!category) {
      return createErrorResponse(400, 'Invalid category parameter', origin);
    }

    const querySpec = {
      query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.categories, @category) ORDER BY c.publishedDate DESC',
      parameters: [{ name: '@category', value: category }]
    };

    const updates = await queryUpdates(querySpec, limit);

    return createSuccessResponse(updates, origin);
  } catch (error) {
    context.error('Error fetching updates by category:', sanitizeError(error));
    return createErrorResponse(500, 'Failed to fetch updates', origin);
  }
}
