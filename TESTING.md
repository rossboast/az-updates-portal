# Testing Guide

This document describes the testing strategy and how to run tests for the Azure Updates Portal.

## Overview

The project includes comprehensive automated tests for the API layer, ensuring reliability and correctness of the data operations and HTTP endpoints.

## Test Statistics

- **Total Tests**: 23
- **Test Files**: 2
- **Test Framework**: Vitest
- **Coverage**: API handlers and CosmosDB client

## Running Tests

### Run All Tests

```bash
cd api
npm test
```

### Run Tests in Watch Mode

```bash
cd api
npm run test:watch
```

### Test Output

```
 Test Files  2 passed (2)
      Tests  23 passed (23)
   Start at  20:46:40
   Duration  769ms
```

## Test Structure

### 1. CosmosDB Client Tests (`cosmosClient.test.js`)

**11 tests covering:**

#### Query Operations
- ✅ Return all mock updates
- ✅ Filter updates by specific category
- ✅ Return distinct categories
- ✅ Limit query results
- ✅ Handle empty query results

#### CRUD Operations
- ✅ Create/update items in mock mode
- ✅ Get item by ID
- ✅ Handle non-existent items

#### Data Structure Validation
- ✅ Verify all required fields present
- ✅ Validate both update and blog types exist
- ✅ Confirm multiple categories available

**Example Test:**
```javascript
it('should return updates with specific category', async () => {
  const querySpec = {
    query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.categories, @category)',
    parameters: [{ name: '@category', value: 'AI' }]
  };
  const results = await queryUpdates(querySpec);
  
  expect(results).toBeDefined();
  expect(Array.isArray(results)).toBe(true);
  expect(results.length).toBeGreaterThan(0);
  expect(results[0].categories).toContain('AI');
});
```

### 2. API Handler Tests (`updates.test.js`)

**12 tests covering:**

#### GET /api/updates
- ✅ Return all updates
- ✅ Filter by category query parameter
- ✅ Respect limit parameter
- ✅ Handle errors gracefully

#### GET /api/categories
- ✅ Return all categories
- ✅ Return unique categories only

#### GET /api/updates/category/{category}
- ✅ Return updates for specific category
- ✅ Return empty array for non-existent category
- ✅ Respect limit parameter

#### API Response Format
- ✅ Include CORS headers
- ✅ Return proper JSON content type
- ✅ Return valid JSON

**Example Test:**
```javascript
it('should return all updates', async () => {
  const request = createMockRequest('http://localhost:7071/api/updates');
  const context = createMockContext();
  
  const response = await getUpdates(request, context);
  
  expect(response.status).toBe(200);
  expect(response.headers['Content-Type']).toBe('application/json');
  
  const body = JSON.parse(response.body);
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(6);
});
```

## Test Data

Tests use the mock data defined in `api/src/lib/cosmosClient.js`:

- **6 sample updates/blogs**
- **13 unique categories**
- **Multiple sources** (Azure Updates, Azure Blog, Azure SDK Blog)
- **Both types** (update and blog)

This ensures tests:
- Run without Azure dependencies
- Are fast and repeatable
- Cover realistic scenarios

## Test Configuration

### Vitest Config (`vitest.config.js`)

```javascript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js'
      ]
    }
  }
});
```

### Environment Setup

Tests automatically set `USE_MOCK_DATA=true` to ensure they use mock data:

```javascript
beforeEach(() => {
  process.env.USE_MOCK_DATA = 'true';
  delete process.env.COSMOS_ENDPOINT;
});
```

## Coverage

Current test coverage focuses on:
- ✅ API endpoints and handlers
- ✅ CosmosDB client operations
- ✅ Mock data functionality
- ✅ Query filtering and limiting
- ✅ Error handling
- ✅ Response formats

### Areas Not Yet Covered
- ⏳ Timer-triggered functions (fetchUpdates, fetchBlogPosts)
- ⏳ RSS feed parsing
- ⏳ Frontend components (Vue.js)

## Adding New Tests

### 1. Create Test File

```bash
touch api/tests/yourFeature.test.js
```

### 2. Write Tests

```javascript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '../src/yourModule.js';

describe('Your Feature', () => {
  it('should do something', async () => {
    const result = await yourFunction();
    expect(result).toBeDefined();
  });
});
```

### 3. Run Tests

```bash
npm test
```

## Continuous Integration

Tests should be run:
- ✅ Before committing changes
- ✅ In CI/CD pipeline
- ✅ Before deploying to Azure

### Example GitHub Actions

```yaml
- name: Run API Tests
  run: |
    cd api
    npm install
    npm test
```

## Manual Testing

### API Endpoints (Local)

```bash
# Start API
cd api && npm start

# Test endpoints
curl http://localhost:7071/api/updates
curl http://localhost:7071/api/categories
curl http://localhost:7071/api/updates/category/AI
```

### Frontend (Local)

```bash
# Start web
cd web && npm run dev

# Open browser
open http://localhost:5173

# Manual testing checklist:
- [ ] Search functionality
- [ ] Type filter (All/Update/Blog)
- [ ] Category filter
- [ ] Date range filter (7 days, 30 days, etc.)
- [ ] Combined filters work together
- [ ] Responsive design on mobile
```

## Debugging Tests

### Run Single Test File

```bash
npm test cosmosClient.test.js
```

### Run Single Test

```bash
npm test -t "should return all mock updates"
```

### Verbose Output

```bash
npm test -- --reporter=verbose
```

### Debug Mode

```bash
node --inspect-brk node_modules/.bin/vitest
```

## Best Practices

1. **Use Mock Data**: Tests should not require Azure resources
2. **Test Behavior**: Focus on what the code does, not implementation
3. **Keep Tests Fast**: All tests should complete in < 1 second
4. **Clear Names**: Test names should describe expected behavior
5. **Arrange-Act-Assert**: Follow the AAA pattern
6. **Independent Tests**: Each test should run independently

## Troubleshooting

### Tests Fail with "Cannot find module"

**Solution**: Ensure dependencies are installed
```bash
cd api && npm install
```

### Tests Hang or Timeout

**Solution**: Check for:
- Missing async/await
- Unresolved promises
- Network calls without mocking

### Mock Data Not Loading

**Solution**: Verify environment variables
```javascript
process.env.USE_MOCK_DATA = 'true';
delete process.env.COSMOS_ENDPOINT;
```

## Future Enhancements

Planned test additions:
- [ ] RSS feed parser unit tests
- [ ] Timer function integration tests
- [ ] Frontend component tests (Vue Test Utils)
- [ ] E2E tests (Playwright)
- [ ] Performance tests
- [ ] Load tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Azure Functions Testing](https://learn.microsoft.com/azure/azure-functions/functions-test-a-function)

---

**Questions?** See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
