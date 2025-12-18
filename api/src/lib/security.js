/**
 * Security utilities for Azure Functions API
 * Provides CORS handling, security headers, and input validation
 */

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://localhost:5173',
  'http://localhost:5173',
  'http://localhost:7071',
  'https://localhost:7071'
];

// Add production origins from environment
if (process.env.WEB_APP_URL) {
  ALLOWED_ORIGINS.push(process.env.WEB_APP_URL);
}

/**
 * Get origin from request (handles both real requests and test mocks)
 * @param {object} request - Request object
 * @returns {string|null} Origin header value or null
 */
export function getOriginFromRequest(request) {
  if (!request) return null;
  
  // Check if headers is a Map or has get method (real Azure Functions request)
  if (request.headers && typeof request.headers.get === 'function') {
    return request.headers.get('origin');
  }
  
  // Check if headers is a plain object (test mock)
  if (request.headers && typeof request.headers === 'object') {
    return request.headers['origin'] || request.headers['Origin'];
  }
  
  return null;
}

/**
 * Get security headers for HTTP responses
 * @param {string|null} origin - Request origin for CORS
 * @returns {object} Security headers object
 */
export function getSecurityHeaders(origin = null) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'public, max-age=300',
  };

  // Only add HSTS if running on HTTPS (Azure handles this)
  if (process.env.WEBSITE_HOSTNAME) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  }

  // Handle CORS
  if (origin) {
    // Check if origin is allowed
    const isAllowed = ALLOWED_ORIGINS.some(allowed => {
      // Exact match or pattern match for Azure websites
      if (origin === allowed) return true;
      if (allowed.includes('azurewebsites.net') && origin.includes('azurewebsites.net')) return true;
      return false;
    });

    if (isAllowed) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Vary'] = 'Origin';
    } else {
      // For local development, allow localhost variations
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Vary'] = 'Origin';
      } else {
        // Fallback: allow first origin (production web app)
        const productionOrigin = ALLOWED_ORIGINS.find(o => o.includes('azurewebsites.net'));
        if (productionOrigin) {
          headers['Access-Control-Allow-Origin'] = productionOrigin;
        } else {
          // Development fallback - still more secure than wildcard
          headers['Access-Control-Allow-Origin'] = ALLOWED_ORIGINS[0] || 'http://localhost:5173';
        }
        headers['Vary'] = 'Origin';
      }
    }
  } else {
    // No origin header - for tests and direct API calls
    // Use a safe default
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

/**
 * Validate and sanitize limit parameter
 * @param {string|number} limitParam - Limit parameter from query string
 * @param {number} defaultLimit - Default limit if invalid
 * @param {number} maxLimit - Maximum allowed limit
 * @returns {number} Validated limit value
 */
export function validateLimit(limitParam, defaultLimit = 50, maxLimit = 1000) {
  const limit = parseInt(limitParam, 10);
  
  // Check if valid number
  if (isNaN(limit) || limit < 1) {
    return defaultLimit;
  }
  
  // Cap at maximum
  if (limit > maxLimit) {
    return maxLimit;
  }
  
  return limit;
}

/**
 * Validate and sanitize category parameter
 * @param {string} category - Category parameter from query/route
 * @returns {string|null} Sanitized category or null if invalid
 */
export function validateCategory(category) {
  if (!category || typeof category !== 'string') {
    return null;
  }
  
  // Trim and sanitize: allow only alphanumeric, spaces, hyphens, underscores
  const sanitized = category.trim().replace(/[^a-zA-Z0-9\s\-_]/g, '');
  
  // Length check (prevent extremely long categories)
  if (sanitized.length === 0 || sanitized.length > 100) {
    return null;
  }
  
  return sanitized;
}

/**
 * Sanitize error for logging (remove sensitive information)
 * @param {Error} error - Error object to sanitize
 * @returns {object} Sanitized error information
 */
export function sanitizeError(error) {
  return {
    message: error.message || 'Unknown error',
    code: error.code,
    statusCode: error.statusCode,
    name: error.name,
    // Deliberately exclude: stack, config, request details
  };
}

/**
 * Create error response with security headers
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @param {string|null} origin - Request origin for CORS
 * @returns {object} Error response object
 */
export function createErrorResponse(status, message, origin = null) {
  return {
    status,
    headers: getSecurityHeaders(origin),
    body: JSON.stringify({ error: message })
  };
}

/**
 * Create success response with security headers
 * @param {any} data - Response data
 * @param {string|null} origin - Request origin for CORS
 * @returns {object} Success response object
 */
export function createSuccessResponse(data, origin = null) {
  return {
    status: 200,
    headers: getSecurityHeaders(origin),
    body: JSON.stringify(data)
  };
}
