# Azure Updates Portal API Documentation

## Base URL

```
Production: https://{function-app-name}.azurewebsites.net/api
Development: http://localhost:7071/api
```

## Authentication

Currently, all endpoints are publicly accessible (`authLevel: 'anonymous'`). Future versions may add authentication.

## Endpoints

### Get All Updates

Retrieve a list of Azure updates and blog posts.

**Endpoint:** `GET /updates`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | No | - | Filter by category (e.g., "Compute", "AI") |
| `limit` | number | No | 50 | Maximum number of results to return |

**Example Request:**
```bash
curl "https://{function-app}.azurewebsites.net/api/updates?limit=10"
```

**Example Response:**
```json
[
  {
    "id": "https://azure.microsoft.com/updates/example-update",
    "title": "New Azure Service Announcement",
    "description": "Azure announces a new service for...",
    "link": "https://azure.microsoft.com/updates/example-update",
    "publishedDate": "2024-10-01T00:00:00.000Z",
    "source": "Azure Updates",
    "type": "update",
    "categories": ["Compute", "Virtual Machines"]
  },
  {
    "id": "https://azure.microsoft.com/blog/example-post",
    "title": "Building Modern Apps with Azure",
    "description": "Learn how to build scalable applications...",
    "link": "https://azure.microsoft.com/blog/example-post",
    "publishedDate": "2024-09-30T10:30:00.000Z",
    "source": "Azure Blog",
    "type": "blog",
    "author": "John Doe",
    "categories": ["Azure", "Development", "AI"]
  }
]
```

**Response Codes:**
- `200 OK`: Success
- `500 Internal Server Error`: Server error

---

### Get Categories

Retrieve all unique categories from stored updates.

**Endpoint:** `GET /categories`

**Query Parameters:** None

**Example Request:**
```bash
curl "https://{function-app}.azurewebsites.net/api/categories"
```

**Example Response:**
```json
[
  "Compute",
  "Integration",
  "AI",
  "Development",
  "Azure",
  "Microsoft",
  "Community",
  "SDK",
  "Virtual Machines",
  "App Service"
]
```

**Response Codes:**
- `200 OK`: Success
- `500 Internal Server Error`: Server error

---

### Get Updates by Category

Retrieve updates filtered by a specific category.

**Endpoint:** `GET /updates/category/{category}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | Yes | Category name (URL-encoded) |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 50 | Maximum number of results |

**Example Request:**
```bash
curl "https://{function-app}.azurewebsites.net/api/updates/category/AI?limit=20"
```

**Example Response:**
```json
[
  {
    "id": "https://azure.microsoft.com/updates/ai-service",
    "title": "New AI Service in Azure",
    "description": "Azure AI services now include...",
    "link": "https://azure.microsoft.com/updates/ai-service",
    "publishedDate": "2024-10-05T00:00:00.000Z",
    "source": "Azure Updates",
    "type": "update",
    "categories": ["AI", "Cognitive Services"]
  }
]
```

**Response Codes:**
- `200 OK`: Success
- `500 Internal Server Error`: Server error

---

## Data Model

### Update/Blog Post Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (usually the URL) |
| `title` | string | Yes | Title of the update or blog post |
| `description` | string | Yes | Brief description or excerpt (max 500 chars for blogs) |
| `link` | string | Yes | URL to the full article |
| `publishedDate` | string (ISO 8601) | Yes | Publication date and time |
| `source` | string | Yes | Source name (e.g., "Azure Updates", "Azure Blog") |
| `type` | string | Yes | Type: "update" or "blog" |
| `categories` | string[] | Yes | Array of category tags |
| `author` | string | No | Author name (blogs only) |

**Example:**
```json
{
  "id": "unique-id",
  "title": "Example Title",
  "description": "This is a description...",
  "link": "https://example.com/article",
  "publishedDate": "2024-10-07T12:00:00.000Z",
  "source": "Source Name",
  "type": "update",
  "categories": ["Category1", "Category2"],
  "author": "Optional Author"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common Error Codes:**
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

---

## Rate Limiting

**Azure Functions Consumption Plan:**
- No hard rate limits
- Subject to Azure Functions scaling limits
- Recommended: Cache responses on client side

**Best Practices:**
- Implement client-side caching (5-10 minutes)
- Use appropriate `limit` parameters
- Handle 429 responses gracefully

---

## CORS

CORS is enabled for all origins (`*`). In production, consider restricting to specific domains.

**Current Configuration:**
```json
{
  "Host": {
    "CORS": "*"
  }
}
```

---

## Pagination

Currently, pagination is handled through the `limit` parameter. There is no offset-based pagination.

**Future Enhancement:**
Continuation token-based pagination for large result sets.

---

## Filtering

### By Category
Use the category-specific endpoint or the `category` query parameter:
```
GET /api/updates?category=Compute&limit=25
GET /api/updates/category/Compute?limit=25
```

### By Type
Filter client-side or request a specific type through a future endpoint enhancement.

### By Date Range
Currently not supported. Filter client-side based on `publishedDate`.

---

## Search

No server-side search is currently implemented. Implement client-side search or use Azure Cognitive Search for advanced scenarios.

---

## Caching

**Recommendations:**
- **Client-Side:** Cache API responses for 5-10 minutes
- **CDN:** Use Azure Front Door or CDN for API responses
- **Browser:** Set appropriate Cache-Control headers

**Example Cache Headers:**
```
Cache-Control: public, max-age=300
```

---

## WebSocket / Real-Time Updates

Not currently supported. Consider Azure SignalR Service for real-time updates in future versions.

---

## Monitoring

All API calls are logged to Application Insights:
- Request duration
- Response status codes
- Exception details
- Custom telemetry

**Query Examples (Application Insights):**

**Failed Requests:**
```kusto
requests
| where success == false
| summarize count() by name, resultCode
```

**Average Response Time:**
```kusto
requests
| summarize avg(duration) by name
```

---

## Examples

### JavaScript/Fetch

```javascript
// Get all updates
const response = await fetch('https://{function-app}.azurewebsites.net/api/updates?limit=20');
const updates = await response.json();

// Get categories
const categoriesResponse = await fetch('https://{function-app}.azurewebsites.net/api/categories');
const categories = await categoriesResponse.json();

// Get updates by category
const aiUpdates = await fetch('https://{function-app}.azurewebsites.net/api/updates/category/AI');
const aiData = await aiUpdates.json();
```

### cURL

```bash
# Get updates
curl -X GET "https://{function-app}.azurewebsites.net/api/updates?limit=10"

# Get categories
curl -X GET "https://{function-app}.azurewebsites.net/api/categories"

# Get updates by category (URL-encoded)
curl -X GET "https://{function-app}.azurewebsites.net/api/updates/category/Compute"
```

### PowerShell

```powershell
# Get updates
$response = Invoke-RestMethod -Uri "https://{function-app}.azurewebsites.net/api/updates?limit=10"
$response | Format-Table

# Get categories
$categories = Invoke-RestMethod -Uri "https://{function-app}.azurewebsites.net/api/categories"
$categories

# Get updates by category
$aiUpdates = Invoke-RestMethod -Uri "https://{function-app}.azurewebsites.net/api/updates/category/AI"
$aiUpdates
```

### Python

```python
import requests

# Get updates
response = requests.get('https://{function-app}.azurewebsites.net/api/updates', 
                       params={'limit': 20})
updates = response.json()

# Get categories
categories = requests.get('https://{function-app}.azurewebsites.net/api/categories').json()

# Get updates by category
ai_updates = requests.get('https://{function-app}.azurewebsites.net/api/updates/category/AI').json()
```

---

## Testing

### Local Testing

Start the Functions locally:
```bash
cd api
npm install
npm start
```

Access at: `http://localhost:7071/api`

### Integration Tests

```javascript
import { describe, it, expect } from 'vitest';

describe('API Endpoints', () => {
  it('should return updates', async () => {
    const response = await fetch('http://localhost:7071/api/updates');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
  
  it('should return categories', async () => {
    const response = await fetch('http://localhost:7071/api/categories');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
```

---

## Future Enhancements

- [ ] **Authentication**: OAuth 2.0 / Microsoft Entra ID
- [ ] **Pagination**: Continuation token support
- [ ] **Search**: Full-text search across updates
- [ ] **Date Filtering**: Query by date range
- [ ] **Webhooks**: Subscribe to new updates
- [ ] **GraphQL**: Alternative query interface
- [ ] **Rate Limiting**: Per-user rate limits
- [ ] **OpenAPI/Swagger**: Auto-generated API docs

---

## Support

For API issues or questions:
1. Check [GitHub Issues](https://github.com/rossboast/az-updates-portal2/issues)
2. Review Application Insights logs
3. Open a new issue with API request/response details

---

## Changelog

### Version 1.0.0 (2024-10-07)
- Initial API release
- GET /updates endpoint
- GET /categories endpoint
- GET /updates/category/{category} endpoint
- CosmosDB backend integration
- Application Insights monitoring

---

## License

This API is part of the Azure Updates Portal project, licensed under the MIT License.
