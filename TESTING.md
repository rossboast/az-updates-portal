# Testing Guide

This document describes the testing strategy and how to run tests for the Azure Updates Portal.

## Overview

The project includes three types of tests:

1. **Unit Tests** - Test individual functions with mock data
2. **Snapshot Tests** - Test against cached real RSS feed data
3. **Integration Tests** - Test live RSS feeds (requires network)

## Test Statistics

- **Total Tests**: 23+ unit tests, 10+ integration tests
- **Test Framework**: Vitest
- **Coverage**: API handlers, CosmosDB client, RSS feeds

## Running Tests

### Run All Unit Tests

```bash
cd api
npm test
```

### Run Tests in Watch Mode

```bash
cd api
npm run test:watch
```

### Run Integration Tests (Live Feeds)

Tests real RSS feeds - requires internet connection:

```bash
cd api
npm run test:integration
```

⚠️ **Note**: Integration tests make live network requests and may take 30+ seconds.

### Run Snapshot Tests (Cached Real Data)

Tests against locally cached real feed data:

```bash
cd api
npm run test:snapshot
```

## Working with Real Data

### Creating a Data Snapshot

Fetch real RSS feed data and cache it locally for testing:

```bash
cd api
npm run snapshot:create
```

This creates `api/tests/fixtures/feed-snapshot.json` with:
- 5 recent Azure updates
- 5 recent blog posts from each blog feed
- 5 recent YouTube videos

**Benefits:**
- ✅ See real categories, titles, and content structure
- ✅ Test without network requests
- ✅ Reproducible tests
- ✅ Understand actual data format

### Refreshing Snapshot Data

Update cached data and re-run snapshot tests:

```bash
cd api
npm run snapshot:refresh
```

**When to refresh:**
- Weekly for current data
- Before major category changes
- When adding new feeds
- When RSS feed structure changes

## Test Structure

### 1. Unit Tests (Mock Data)

Fast, isolated tests using mock data:

**Files:**

- `cosmosClient.test.js` - Database operations
- `updates.test.js` - API endpoints
- `fetchEventVideos.test.js` - Video handler

**CosmosDB Client Tests (`cosmosClient.test.js`)**

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

**API Handler Tests (`updates.test.js`)**

12 tests covering API endpoints, category filtering, and response formats.

**Example:**

```javascript
it('should return all updates', async () => {
  const request = createMockRequest('http://localhost:7071/api/updates');
  const context = createMockContext();
  
  const response = await getUpdates(request, context);
  
  expect(response.status).toBe(200);
  const body = JSON.parse(response.body);
  expect(Array.isArray(body)).toBe(true);
});
```

### 2. Snapshot Tests (Cached Real Data)

**File:** `snapshotData.test.js`

Tests validate:

- Real category names from Azure
- Actual title formats
- Author information structure
- Video ID formats
- Link patterns

**Example:**

```javascript
it('should show real categories from Azure updates', () => {
  const updates = snapshot.feeds.updates.flatMap(f => f.items);
  const categories = new Set();
  
  updates.forEach(u => u.categories?.forEach(c => categories.add(c)));
  
  console.log('Real categories:', Array.from(categories));
  expect(categories.size).toBeGreaterThan(0);
});
```

### 3. Integration Tests (Live Feeds)

**File:** `integration/fetchRealData.test.js`

Tests validate:

- RSS feeds are accessible
- Feed structure hasn't changed
- Recent content is available
- Video IDs are valid
- Categories exist

**Example:**

```javascript
it('should fetch and parse Azure updates', async () => {
  const feed = await parser.parseURL('https://azure.microsoft.com/en-us/updates/feed/');
  
  expect(feed.items.length).toBeGreaterThan(0);
  expect(feed.items[0].title).toBeDefined();
}, 30000); // 30 second timeout
```

## Testing Workflow

### For UI Development

1. Use **unit tests** with mock data for fast feedback
2. Run `npm run snapshot:create` to see real data structure
3. Update mock data to match real patterns
4. Use snapshot tests to validate assumptions

### Before Deployment

1. Run `npm run snapshot:refresh` to update cached data
2. Run `npm run test:integration` to verify feeds are working
3. Run `npm test` to ensure all unit tests pass
4. Check console output for real categories and content

### When Adding New Feeds

1. Add feed to handlers
2. Run `npm run test:integration` to validate feed works
3. Run `npm run snapshot:create` to capture sample data
4. Review `feed-snapshot.json` to understand data structure
5. Update mock data and tests accordingly

## Understanding Real Data

After creating a snapshot, examine the JSON file:

```bash
cat api/tests/fixtures/feed-snapshot.json
```

Or run snapshot tests with console output:

```bash
npm run test:snapshot
```

You'll see:

- 📊 Real category names from Azure
- ✍️ Actual author names
- 🎥 Real video titles and IDs
- 📅 Recent publication dates

Use this information to:

- Update category filters in UI
- Adjust mock data realism
- Validate RSS parsing logic
- Plan new features

## Continuous Integration

In CI/CD pipelines:

- **Run unit tests always** (fast, no network)
- **Run integration tests periodically** (catch feed changes)
- **Update snapshots weekly** (keep cached data fresh)

## Troubleshooting

### Snapshot File Missing

```text
⚠️  No snapshot found. Run: npm run snapshot:create
```

**Solution:** Create snapshot with `npm run snapshot:create`

### Integration Tests Timeout

**Cause:** Network issues or slow feeds  
**Solution:** Increase timeout or skip with `npm test` (unit tests only)

### Stale Snapshot Data

**Symptom:** Categories don't match production  
**Solution:** Refresh with `npm run snapshot:refresh`

## Best Practices

1. **Run unit tests frequently** during development
2. **Create snapshots weekly** to stay current with real data
3. **Run integration tests before major releases**
4. **Commit snapshot files** to git for team consistency
5. **Document unexpected real data patterns** you discover
6. **Update mock data** to reflect real data structure

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
