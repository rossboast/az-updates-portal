# Features Guide

Complete guide to all features in the Azure Updates Portal.

## Core Features

### 1. Content Aggregation

**Automatically collects updates from:**
- Azure Updates RSS feed (every 6 hours)
- Azure Blog (every 12 hours)
- Azure SDK Blog (every 12 hours)
- Azure Tech Community (every 12 hours)

**What's collected:**
- Title
- Description/excerpt
- Link to original content
- Publication date
- Source
- Categories
- Author (for blogs)

### 2. Search & Filter

#### Search Box
**Type**: Text input  
**Searches**: Title and description fields  
**Behavior**: Real-time, case-insensitive  
**Example**: Type "Azure Functions" to find all related content

#### Type Filter
**Options**: All, Update, Blog  
**Purpose**: Filter by content type  
**Usage**: Click button to toggle  
**Example**: Select "Blog" to see only blog posts

#### Category Filter
**Options**: Dynamic (based on content)  
**Common Categories**: AI, Compute, Integration, Development, Azure  
**Purpose**: Filter by topic area  
**Usage**: Click category button to filter  
**Example**: Select "AI" to see AI-related updates

#### Date Range Filter ⭐ NEW
**Options**:
- All Time (default)
- Last 7 Days
- Last 14 Days
- Last 30 Days
- Last 3 Months
- Last 6 Months
- Last 12 Months

**Purpose**: Filter by publication date  
**Usage**: Click date range button to filter  
**Example**: Select "Last 7 Days" for recent updates

#### Combined Filtering
**All filters work together:**
```
Type: Blog
Category: AI
Date Range: Last 30 Days
Search: "machine learning"

→ Result: Blog posts about AI and machine learning from the last 30 days
```

### 3. Update Cards

**Each card displays:**
- Type badge (update/blog)
- Title
- Source name
- Description (truncated)
- Categories as tags
- Publication date
- "Read More" link

**Interactions:**
- Hover for elevation effect
- Click "Read More" to open original article (new tab)
- Click category tags to filter by that category (future feature)

### 4. Responsive Design

**Mobile (< 768px)**:
- Single column layout
- Stacked filters
- Touch-optimized buttons

**Tablet (768px - 1024px)**:
- Two column grid
- Horizontal filters

**Desktop (> 1024px)**:
- Three column grid
- Full filter bar
- Optimal spacing

### 5. Real-time Updates

**Client-side filtering**:
- Instant results (no page reload)
- Smooth transitions
- Maintains scroll position

**Server-side updates**:
- Timer functions run automatically
- New content appears on refresh
- No manual intervention needed

## API Features

### REST Endpoints

#### GET /api/updates
**Description**: Get all updates  
**Query Parameters**:
- `category` (string): Filter by category
- `limit` (number): Maximum results (default: 50)

**Example**:
```bash
curl "http://localhost:7071/api/updates?category=AI&limit=10"
```

#### GET /api/categories
**Description**: Get all unique categories  
**Query Parameters**: None

**Example**:
```bash
curl "http://localhost:7071/api/categories"
```

#### GET /api/updates/category/{category}
**Description**: Get updates for specific category  
**Path Parameters**:
- `category` (string): Category name

**Query Parameters**:
- `limit` (number): Maximum results (default: 50)

**Example**:
```bash
curl "http://localhost:7071/api/updates/category/Compute?limit=20"
```

### Mock Data Mode

**For local development:**
- 6 sample updates/blogs
- 13 categories
- No Azure dependencies
- Instant responses

**Activation**:
- Automatic when no `COSMOS_ENDPOINT` set
- Or set `USE_MOCK_DATA=true`

## Developer Features

### 1. Extensibility

**Add new feed source** (5 minutes):
```javascript
// In api/src/handlers/fetchBlogPosts.js
const BLOG_FEEDS = [
  {
    url: 'https://your-blog.com/feed',
    name: 'Your Blog',
    categories: ['Azure', 'Custom']
  }
];
```

**Add new API endpoint** (15 minutes):
1. Create handler in `api/src/handlers/`
2. Register in `api/src/app.js`
3. Update frontend if needed

**Customize UI** (10 minutes):
- Colors: Edit `web/src/style.css`
- Layout: Modify `web/src/App.vue`
- Filters: Update `web/src/stores/updates.js`

### 2. Testing

**API Tests**:
- 23 automated tests
- Vitest framework
- Mock data based
- Run: `cd api && npm test`

**Test Coverage**:
- ✅ CosmosDB client (11 tests)
- ✅ API handlers (12 tests)
- ✅ Query operations
- ✅ Response formats

### 3. Local Development

**Zero Azure Dependencies**:
```bash
# Terminal 1
cd api && npm start

# Terminal 2
cd web && npm run dev

# Open http://localhost:5173
```

**Features in local mode**:
- Mock data with 6 samples
- All filters functional
- Search works
- Date range filtering
- Hot module replacement (HMR)

### 4. Monitoring

**Application Insights**:
- Request tracking
- Performance metrics
- Error logging
- Custom telemetry

**Logs**:
- Function execution logs
- Timer trigger logs
- Error traces
- Performance data

## Advanced Features

### 1. Data Retention

**Options for 12-month retention**:

**Option A**: Document-level TTL
```javascript
{
  id: 'update-1',
  ttl: 31536000  // 12 months
}
```

**Option B**: Scheduled cleanup
```javascript
app.timer('cleanupOldUpdates', {
  schedule: '0 0 0 1 * *',
  handler: deleteOldItems
});
```

**Option C**: Container TTL (recommended)
- Set on CosmosDB container
- Automatic deletion
- No code needed

### 2. Pre-warming

**Options for faster first load**:

**Option A**: Cold start pre-fetch
- Fetch last 7 days on function start
- Populates cache immediately

**Option B**: Scheduled pre-fetch
- Timer runs hourly
- Keeps cache warm

**Option C**: On-demand with cache
- First request triggers fetch
- Subsequent requests use cache

### 3. Performance Optimization

**Client-side**:
- Virtual scrolling (future)
- Lazy loading images
- Component code splitting
- Service worker caching

**Server-side**:
- CosmosDB indexing
- Query optimization
- Response compression
- CDN for static assets

### 4. Security

**Current**:
- HTTPS only
- Managed identities
- CORS configured
- Input validation

**Future**:
- User authentication (Microsoft Entra ID)
- Rate limiting per user
- API key authentication
- Content moderation

## Future Features

### Short-term
- [ ] Bookmark/save functionality
- [ ] Email notifications
- [ ] Custom user preferences
- [ ] Mobile app (PWA)

### Medium-term
- [ ] AI-powered summaries
- [ ] Cross-reference with Microsoft Learn
- [ ] Social sharing
- [ ] Comments and discussions

### Long-term
- [ ] Real-time updates (SignalR)
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Recommendation engine

## Feature Matrix

| Feature | Status | Availability |
|---------|--------|--------------|
| Content Aggregation | ✅ Live | All |
| Search | ✅ Live | All |
| Type Filter | ✅ Live | All |
| Category Filter | ✅ Live | All |
| Date Range Filter | ✅ Live | All |
| Combined Filters | ✅ Live | All |
| Responsive Design | ✅ Live | All |
| Mock Data Mode | ✅ Live | Dev |
| API Tests | ✅ Live | Dev |
| Local Development | ✅ Live | Dev |
| Azure Deployment | ✅ Live | Prod |
| User Authentication | ⏳ Planned | - |
| Bookmarks | ⏳ Planned | - |
| Email Notifications | ⏳ Planned | - |

## Usage Examples

### Example 1: Find Recent AI Updates
1. Open portal
2. Select "AI" category
3. Select "Last 7 Days"
4. Browse results

### Example 2: Search Specific Topic
1. Type "Container Apps" in search
2. Select "Update" type
3. Select "Last 30 Days"
4. View filtered results

### Example 3: Explore Blogs
1. Select "Blog" type
2. Select "Development" category
3. Scroll through blog posts
4. Click "Read More" for details

### Example 4: Developer Research
1. Search "Bicep"
2. Select "All Time"
3. Read through updates
4. Check original links for more info

## Performance Metrics

**Target Performance**:
- First load: < 2 seconds
- Filter action: < 100ms
- Search results: < 50ms
- API response: < 200ms

**Measured Performance**:
- Local: All targets met
- Azure: Depends on region and load

## Accessibility

**WCAG AA Compliant**:
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast ratios
- ✅ Focus indicators
- ✅ Semantic HTML

**Features**:
- Alt text on images
- ARIA labels on buttons
- Descriptive link text
- Logical tab order

## Browser Support

**Supported**:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari 14+
- ✅ Chrome Mobile 90+

**Not Supported**:
- ❌ Internet Explorer
- ❌ Older browsers without ES6

## Resources

- [User Guide](README.md)
- [API Documentation](API.md)
- [Testing Guide](TESTING.md)
- [Development Guide](LOCAL_DEVELOPMENT.md)

---

**Questions?** Open an issue on GitHub or see the [CONTRIBUTING.md](CONTRIBUTING.md) guide.
