# Azure Updates Portal - Architecture Documentation

## Overview

The Azure Updates Portal is a modern web application that aggregates Azure announcements, updates, and blog posts from multiple sources into a single, filterable interface.

## Technology Stack

### Frontend
- **Framework**: Vue.js 3 with Composition API
- **State Management**: Pinia
- **Build Tool**: Vite
- **Hosting**: Azure App Service (Linux, Node.js 20)
- **Styling**: Custom CSS with responsive design

### Backend
- **Runtime**: Azure Functions (Node.js 20)
- **Programming Model**: Azure Functions v4 (JavaScript)
- **API Pattern**: REST with HTTP triggers
- **Data Collection**: Timer-triggered functions
- **Authentication**: Managed Identity

### Database
- **Type**: Azure CosmosDB (NoSQL)
- **API**: SQL API
- **Partitioning**: By document type (update/blog)
- **Consistency**: Session level
- **Tier**: Free tier enabled

### Infrastructure
- **IaC Tool**: Azure Bicep
- **Deployment**: Azure Developer CLI (azd)
- **Monitoring**: Application Insights
- **Storage**: Azure Storage (for Function deployments)

## System Architecture

```
┌───────────────────────────────────────────────────────────┐
│                        Internet                           │
└────────────────────┬──────────────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │   Azure Front Door   │ (Optional Future Enhancement)
         └───────────┬──────────┘
                     │
         ┌───────────▼──────────────────────────────────────┐
         │        App Service (Linux)                       │
         │  ┌────────────────────────────────────────┐     │
         │  │     Vue.js SPA (Static Files)          │     │
         │  │  - Filters Component                   │     │
         │  │  - Update Cards                        │     │
         │  │  - Pinia Store                         │     │
         │  └────────────────────────────────────────┘     │
         └───────────┬──────────────────────────────────────┘
                     │ HTTPS
                     │
         ┌───────────▼──────────────────────────────────────┐
         │     Azure Functions (Consumption)                │
         │  ┌────────────────────────────────────────┐     │
         │  │  HTTP Triggers (REST API)              │     │
         │  │  - GET /api/updates                    │     │
         │  │  - GET /api/categories                 │     │
         │  │  - GET /api/updates/category/{id}      │     │
         │  └────────────────────────────────────────┘     │
         │  ┌────────────────────────────────────────┐     │
         │  │  Timer Triggers (Data Collection)      │     │
         │  │  - fetchAzureUpdates (6 hours)         │     │
         │  │  - fetchBlogPosts (12 hours)           │     │
         │  └────────────────────────────────────────┘     │
         └───────────┬──────────────────────────────────────┘
                     │ Managed Identity
                     │
         ┌───────────▼──────────────────────────────────────┐
         │        CosmosDB (SQL API)                        │
         │  ┌────────────────────────────────────────┐     │
         │  │     Database: AzureUpdatesDB           │     │
         │  │       Container: Updates               │     │
         │  │         Partition Key: /type           │     │
         │  │                                        │     │
         │  │  Document Schema:                      │     │
         │  │  {                                     │     │
         │  │    id: string,                         │     │
         │  │    title: string,                      │     │
         │  │    description: string,                │     │
         │  │    link: string,                       │     │
         │  │    publishedDate: ISO8601,             │     │
         │  │    source: string,                     │     │
         │  │    type: "update" | "blog",            │     │
         │  │    categories: string[],               │     │
         │  │    author?: string                     │     │
         │  │  }                                     │     │
         │  └────────────────────────────────────────┘     │
         └──────────────────────────────────────────────────┘

         ┌───────────────────────────────────────────────────┐
         │     External RSS Feeds                            │
         │  - Azure Updates Feed                             │
         │  - Azure Blog                                     │
         │  - Azure SDK Blog                                 │
         │  - Azure Tech Community                           │
         └───────────────────────────────────────────────────┘
```

## Data Flow

### 1. Data Collection (Timer-Triggered)

```
Timer Trigger (Cron)
    │
    ▼
Fetch RSS Feed (HTTPS)
    │
    ▼
Parse XML/RSS
    │
    ▼
Extract Metadata
    │
    ▼
Transform to Schema
    │
    ▼
Upsert to CosmosDB
```

**Schedule:**
- Azure Updates: `0 0 */6 * * *` (Every 6 hours)
- Blog Posts: `0 0 */12 * * *` (Every 12 hours)

### 2. API Request Flow (HTTP-Triggered)

```
Browser Request
    │
    ▼
App Service (Vue.js)
    │
    ▼
API Gateway (Functions)
    │
    ▼
Query Builder
    │
    ▼
CosmosDB Query
    │
    ▼
Transform Results
    │
    ▼
JSON Response
    │
    ▼
Update UI (Pinia Store)
```

## Component Architecture

### Frontend Components

```
App.vue
├── Filters.vue
│   ├── SearchBox
│   ├── TypeFilter (All/Update/Blog)
│   └── CategoryFilter (Dynamic)
└── UpdateCard.vue (v-for)
    ├── Title
    ├── Source
    ├── Description
    ├── Categories
    ├── PublishedDate
    └── Link
```

### Backend Handlers

```
api/src/
├── app.js (Main entry point)
├── handlers/
│   ├── updates.js
│   │   ├── getUpdates()
│   │   ├── getCategories()
│   │   └── getUpdatesByCategory()
│   ├── fetchAzureUpdates.js
│   │   └── fetchAzureUpdates()
│   └── fetchBlogPosts.js
│       └── fetchBlogPosts()
└── lib/
    └── cosmosClient.js
        ├── queryUpdates()
        ├── createOrUpdateItem()
        └── getItemById()
```

## Security Architecture

### Authentication & Authorization

1. **Managed Identity**: Function App uses system-assigned managed identity
2. **CosmosDB RBAC**: Role-based access with minimal permissions
3. **No Secrets**: All authentication uses Azure AD tokens
4. **HTTPS Only**: All endpoints enforce TLS 1.2+

### Security Features

- **CORS**: Configured for specific origins
- **CSP Headers**: Content Security Policy (future)
- **Input Validation**: RSS feed validation
- **Output Encoding**: XSS prevention in frontend
- **Rate Limiting**: Built-in with Functions consumption plan

## Monitoring & Observability

### Application Insights Integration

**Tracked Metrics:**
- HTTP request duration and count
- Function execution time
- CosmosDB query performance
- Error rates and exceptions
- Custom events for data collection

**Dashboards:**
- Request success rate
- Average response time
- Failed requests
- Resource utilization

### Logging Strategy

**Frontend:**
- Console errors (development)
- Application Insights JS SDK (production)

**Backend:**
- Function execution logs
- Custom telemetry events
- Exception tracking
- Dependency tracking (CosmosDB, HTTP calls)

## Performance Optimization

### Frontend
- **Code Splitting**: Vite automatic chunking
- **Lazy Loading**: Component-level lazy loading
- **Caching**: Browser cache for static assets
- **Minification**: Production build optimization

### Backend
- **Connection Pooling**: CosmosDB client reuse
- **Query Optimization**: Indexed queries on partitionKey
- **Cold Start Mitigation**: Premium plan option available
- **Batch Operations**: Bulk insert for RSS items

### Database
- **Partitioning**: By document type for even distribution
- **Indexing**: Default indexing on all properties
- **Query Optimization**: Use partition key in queries
- **TTL**: Optional time-to-live for old updates

## Scalability

### Horizontal Scaling

**Function App:**
- Automatic scaling with consumption plan
- Up to 200 instances
- Scale based on HTTP load and timer triggers

**CosmosDB:**
- Autoscale RU/s (400-4000 initially)
- Partition key ensures even distribution
- Multiple regions (optional)

### Capacity Planning

**Expected Load:**
- RSS feeds: ~100-500 items per fetch
- API requests: ~100-1000 per hour
- Storage: ~1 GB per year

**Scaling Triggers:**
- Function App: HTTP request queue depth
- CosmosDB: RU/s consumption > 80%

## Disaster Recovery

### Backup Strategy

**CosmosDB:**
- Automatic continuous backup
- Point-in-time restore (30 days)
- Geo-redundant by default

**Application:**
- Infrastructure as Code (reproducible)
- Source code in Git
- Deployment automation

### Recovery Procedures

1. **Data Loss**: Restore from CosmosDB backup
2. **Region Failure**: Deploy to new region with azd
3. **Code Regression**: Roll back with azd previous version
4. **Configuration Error**: Update Bicep and redeploy

## Extensibility

### Adding New Feed Sources

**Steps:**
1. Add feed URL to `fetchBlogPosts.js` or create new handler
2. Update feed parser if format differs
3. Deploy with `azd deploy`

**Example:**
```javascript
const BLOG_FEEDS = [
  // ... existing feeds
  {
    url: 'https://new-blog.com/feed',
    name: 'New Blog',
    categories: ['Azure', 'Custom']
  }
];
```

### Adding New API Endpoints

**Steps:**
1. Create handler in `api/src/handlers/`
2. Register in `api/src/app.js`
3. Update frontend to consume endpoint

**Example:**
```javascript
app.http('newEndpoint', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'custom/endpoint',
  handler: customHandler
});
```

### Frontend Customization

**Common Modifications:**
- **Theme**: Edit `web/src/style.css`
- **Filters**: Modify `web/src/stores/updates.js`
- **Layout**: Update `web/src/App.vue`
- **Components**: Extend or replace in `web/src/components/`

## Cost Optimization

### Current Cost Estimate

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Azure Functions | Consumption | $0-5 (free tier) |
| CosmosDB | Free Tier | $0 (first 1000 RU/s) |
| App Service | B1 Basic | $13 |
| Storage | Standard | $0.01 |
| Application Insights | Pay-as-you-go | $2-5 |
| **Total** | | **~$15-20** |

### Optimization Strategies

1. **Use Free Tier**: App Service F1 instead of B1 ($0)
2. **Reduce Frequency**: Less frequent RSS fetching
3. **Shared Resources**: Multiple apps on same App Service Plan
4. **Reserved Instances**: For predictable, long-term workloads

## Testing Strategy

### Unit Tests
- Function handlers
- RSS parsers
- CosmosDB client
- Vue components (future)

### Integration Tests
- API endpoints
- Database operations
- RSS feed fetching

### E2E Tests
- User flows (Playwright)
- Filter functionality
- Search behavior

## Deployment Pipeline

### CI/CD Flow (Future)

```
Git Push
    │
    ▼
GitHub Actions
    │
    ├─▶ Run Tests
    │
    ├─▶ Build Frontend
    │
    ├─▶ Build Backend
    │
    ├─▶ Validate Bicep
    │
    └─▶ Deploy with azd
```

## Future Enhancements

### Short Term
- [ ] User authentication (Microsoft Entra ID)
- [ ] Personalized feed preferences
- [ ] Bookmark/favorite updates
- [ ] Email notifications

### Medium Term
- [ ] AI-powered content summarization
- [ ] Cross-reference with Microsoft Learn
- [ ] Social sharing features
- [ ] RSS feed for filtered content

### Long Term
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Real-time updates (SignalR)
- [ ] Analytics dashboard for admins

## Compliance & Governance

### Data Privacy
- No PII collected
- Public data only (RSS feeds)
- GDPR compliant (no user data)

### Resource Tagging
- Environment tags (dev/prod)
- Cost center tracking
- Owner identification

### Security Scanning
- Dependabot for npm packages
- Bicep linting
- Application Insights security monitoring

## Support & Maintenance

### Regular Tasks
- Monitor Application Insights alerts
- Review error logs weekly
- Update dependencies monthly
- Backup verification quarterly

### Emergency Contacts
- Azure Support: via Azure Portal
- On-call Engineer: [TBD]
- Incident Response: [TBD]

## References

- [Azure Functions Best Practices](https://learn.microsoft.com/azure/azure-functions/functions-best-practices)
- [CosmosDB Partitioning](https://learn.microsoft.com/azure/cosmos-db/partitioning-overview)
- [Vue.js 3 Documentation](https://vuejs.org/)
- [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)
