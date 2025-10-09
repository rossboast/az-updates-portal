# Data Pre-fetch Options for Azure Updates Portal

## Overview

This document explains different strategies for pre-warming the CosmosDB cache with recent updates to improve initial response times and reduce cold start latency.

## Current Architecture

**Current Behavior:**
- Timer-triggered functions (`fetchUpdates` and `fetchBlogPosts`) run every 6 and 12 hours respectively
- These functions fetch RSS feeds and populate CosmosDB
- API endpoints read from CosmosDB
- First request after function cold start may experience slight delay

**Current Data Flow:**
```
RSS Sources → Timer Functions → CosmosDB → API Endpoints → Frontend
```

## Option A: Cold Start Pre-fetch (Recommended)

### Description
Add a startup function that runs when the Azure Function app cold-starts. This function fetches the most recent updates immediately, ensuring the database is pre-populated before the first user request.

### Implementation

**1. Create a new handler: `api/src/handlers/warmupCache.js`**

```javascript
import { fetchUpdates } from './fetchUpdates.js';
import { fetchBlogPosts } from './fetchBlogPosts.js';

export async function warmupCache(context) {
  context.log('Warming up cache on function startup...');
  
  try {
    // Fetch recent updates in parallel
    await Promise.all([
      fetchUpdates(null, context),
      fetchBlogPosts(null, context)
    ]);
    
    context.log('Cache warmup complete');
  } catch (error) {
    context.error('Cache warmup failed:', error);
    // Don't throw - allow function to continue even if warmup fails
  }
}
```

**2. Register the warmup function in `api/src/app.js`**

```javascript
import { warmupCache } from './handlers/warmupCache.js';

// Add warmup trigger - runs on function app startup
app.warmup('warmupCache', {
  handler: warmupCache
});
```

### Advantages
✅ **Zero configuration** - Uses existing fetch functions  
✅ **Automatic** - Runs on every cold start  
✅ **Fast user response** - First request already has data  
✅ **No additional costs** - Only runs on cold start  
✅ **Built-in Azure feature** - Uses Azure Functions warmup trigger  

### Disadvantages
❌ **Adds to cold start time** - Function takes slightly longer to start  
❌ **May fetch unnecessary data** - Runs even if no requests come  
❌ **Limited control** - Can't configure what to pre-fetch  

### Expected Behavior
- Function cold starts → Warmup trigger fires → Fetches last 7 days of updates
- Typical fetch time: 2-5 seconds for ~50-100 updates
- First user request: Instant response (data already in CosmosDB)
- Subsequent requests: Continue to be instant

### Recommended Pre-fetch Size
**50-100 updates** (approximately last 7 days):
- Typical Azure Updates: 10-15 per week
- Blog posts: 5-10 per week across all sources
- Total: ~20-25 new items per week
- Pre-fetch 4-5 weeks = 80-125 items

---

## Option B: Scheduled Pre-fetch

### Description
Add a separate timer function that runs more frequently (e.g., every hour) to keep the cache fresh with recent content.

### Implementation

**1. Create `api/src/handlers/refreshCache.js`**

```javascript
import { fetchUpdates } from './fetchUpdates.js';
import { fetchBlogPosts } from './fetchBlogPosts.js';

export async function refreshCache(myTimer, context) {
  context.log('Refreshing cache with recent updates...');
  
  try {
    // Fetch only recent updates (lighter than full fetch)
    await Promise.all([
      fetchUpdates(myTimer, context),
      fetchBlogPosts(myTimer, context)
    ]);
    
    context.log('Cache refresh complete');
  } catch (error) {
    context.error('Cache refresh failed:', error);
  }
}
```

**2. Register in `api/src/app.js`**

```javascript
import { refreshCache } from './handlers/refreshCache.js';

// Runs every hour to keep cache fresh
app.timer('refreshCache', {
  schedule: '0 0 * * * *', // Every hour
  handler: refreshCache
});
```

### Advantages
✅ **Predictable freshness** - Cache updated every hour  
✅ **No cold start impact** - Doesn't affect function startup time  
✅ **Configurable frequency** - Easy to adjust schedule  
✅ **Independent of user traffic** - Always keeps cache warm  

### Disadvantages
❌ **Higher costs** - Runs 24 times per day (vs 2-4 times currently)  
❌ **Potentially wasteful** - Fetches even during low-traffic periods  
❌ **More Azure Functions executions** - Increased consumption charges  
❌ **Redundant with existing timers** - Overlaps with current 6/12 hour schedule  

### Expected Costs
- Current: ~4 executions/day (6h + 12h timers)
- With hourly refresh: ~28 executions/day
- **7x increase in timer executions**
- Estimated additional cost: $1-2/month

---

## Option C: On-Demand Pre-fetch (Current Implementation + Enhancement)

### Description
Keep the current timer-based approach but optimize the initial fetch to be more efficient by limiting the time range.

### Implementation

**1. Modify existing fetch functions to accept date range**

```javascript
// In fetchUpdates.js and fetchBlogPosts.js
export async function fetchUpdates(myTimer, context, options = {}) {
  const { daysBack = null } = options;
  
  context.log('Fetching Azure updates...');
  
  if (daysBack) {
    context.log(`Fetching updates from last ${daysBack} days only`);
  }
  
  // ... existing fetch logic
  
  // Filter by date if daysBack specified
  let updates = parseAzureUpdatesRSS(xmlText);
  
  if (daysBack) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    updates = updates.filter(update => 
      new Date(update.publishedDate) >= cutoffDate
    );
  }
  
  // ... rest of function
}
```

**2. Add a first-run detection mechanism**

```javascript
// In cosmosClient.js
export async function isFirstRun() {
  if (useMockData) return false;
  
  try {
    const { resources } = await container.items.query({
      query: 'SELECT VALUE COUNT(1) FROM c'
    }).fetchAll();
    
    return resources[0] === 0; // True if container is empty
  } catch (error) {
    return false;
  }
}
```

**3. Create intelligent initial fetch**

```javascript
// In warmupCache.js
import { isFirstRun } from '../lib/cosmosClient.js';
import { fetchUpdates } from './fetchUpdates.js';
import { fetchBlogPosts } from './fetchBlogPosts.js';

export async function warmupCache(context) {
  context.log('Checking if initial cache warmup needed...');
  
  const firstRun = await isFirstRun();
  
  if (firstRun) {
    context.log('First run detected - fetching last 7 days of updates');
    await Promise.all([
      fetchUpdates(null, context, { daysBack: 7 }),
      fetchBlogPosts(null, context, { daysBack: 7 })
    ]);
  } else {
    context.log('Cache already populated, skipping warmup');
  }
}
```

### Advantages
✅ **Efficient** - Only pre-fetches on first deployment  
✅ **Smart** - Detects if cache is already populated  
✅ **No ongoing costs** - Doesn't run repeatedly  
✅ **Configurable range** - Easy to adjust days back  
✅ **Best of both worlds** - Combines A and B benefits  

### Disadvantages
❌ **Slightly complex** - Requires more logic than other options  
❌ **First-run detection** - Adds database query overhead  

---

## Comparison Matrix

| Feature | Option A (Cold Start) | Option B (Scheduled) | Option C (On-Demand) |
|---------|----------------------|---------------------|---------------------|
| **Cold Start Impact** | Medium (2-5s added) | None | Low (only first time) |
| **User Experience** | Excellent | Excellent | Good |
| **Cost Impact** | None | Medium ($1-2/mo) | None |
| **Complexity** | Low | Low | Medium |
| **Flexibility** | Low | High | High |
| **Data Freshness** | On cold start | Every hour | Every 6/12 hours |
| **Recommended For** | Most use cases | High-traffic sites | Cost-conscious deployments |

---

## Recommendation: Hybrid Approach (Option A + Enhancements)

The optimal solution combines Option A with intelligent enhancements:

### Recommended Implementation

**1. Add Warmup Trigger (Option A)**
```javascript
// In app.js
app.warmup('warmupCache', {
  handler: warmupCache
});
```

**2. Enhance with Smart Detection (Option C)**
```javascript
// In warmupCache.js
export async function warmupCache(context) {
  const firstRun = await isFirstRun();
  
  if (firstRun) {
    // First deployment - fetch last 7 days
    await Promise.all([
      fetchUpdates(null, context, { daysBack: 7 }),
      fetchBlogPosts(null, context, { daysBack: 7 })
    ]);
  } else {
    // Already have data - skip warmup to reduce cold start time
    context.log('Cache already populated');
  }
}
```

**3. Keep Existing Timers**
```javascript
// Continue running every 6/12 hours for regular updates
app.timer('fetchUpdates', {
  schedule: '0 0 */6 * * *',
  handler: fetchUpdates
});

app.timer('fetchBlogPosts', {
  schedule: '0 0 */12 * * *',
  handler: fetchBlogPosts
});
```

### Why This Works Best

✅ **Fast first response** - Data ready on first request  
✅ **Low cost** - No additional recurring executions  
✅ **Smart** - Only fetches when needed  
✅ **Minimal cold start impact** - Skips warmup after first run  
✅ **Simple to maintain** - Uses existing fetch functions  
✅ **Production-ready** - Handles edge cases gracefully  

---

## Expected Data Volumes

### Last 7 Days
- **Azure Updates RSS**: ~10-15 items
- **Azure Blog**: ~3-5 posts
- **Azure SDK Blog**: ~1-2 posts
- **Azure Tech Community**: ~2-3 posts
- **Total**: ~20-25 items
- **Fetch time**: 2-3 seconds
- **Storage**: <50KB

### Last 30 Days
- **Total**: ~80-100 items
- **Fetch time**: 5-8 seconds
- **Storage**: <200KB

### Last 12 Months (Full History)
- **Total**: ~1000-1200 items
- **Fetch time**: 30-60 seconds
- **Storage**: ~2-3MB

**Recommendation**: Pre-fetch last 7 days (20-25 items) for optimal balance of speed and completeness.

---

## Implementation Steps

### To Implement Option A (Recommended)

1. **Create warmup handler**
   ```bash
   # Create new file
   touch api/src/handlers/warmupCache.js
   ```

2. **Add warmup logic** (see code above)

3. **Register in app.js**
   ```javascript
   import { warmupCache } from './handlers/warmupCache.js';
   
   app.warmup('warmupCache', {
     handler: warmupCache
   });
   ```

4. **Test locally**
   ```bash
   cd api
   npm start
   # Check logs for "Warming up cache" message
   ```

5. **Deploy**
   ```bash
   azd deploy
   ```

6. **Verify**
   - Check Azure Portal → Function App → Functions
   - Should see new "warmupCache" function
   - Check Application Insights for warmup logs

---

## Monitoring and Validation

### Key Metrics to Monitor

**Application Insights Queries:**

```kusto
// Warmup execution time
traces
| where message contains "Warming up cache"
| project timestamp, message, duration = datetime_diff('second', timestamp, prev(timestamp))

// Items fetched during warmup
traces
| where message contains "Found" and message contains "updates"
| parse message with * "Found " count:int " " *
| summarize TotalItems = sum(count) by bin(timestamp, 1d)

// Cold start impact
requests
| where name == "warmupCache"
| summarize avg(duration), max(duration), count()
```

### Success Criteria

✅ Warmup completes in <5 seconds  
✅ First user request responds in <500ms  
✅ 20-50 items pre-fetched  
✅ No errors in warmup logs  
✅ Cold start time <10 seconds total  

---

## Cost Analysis

### Current Cost (No Pre-fetch)
- **Timer executions**: 4/day × 30 days = 120/month
- **API requests**: Variable (0-1000/month)
- **CosmosDB RU/s**: 400 (free tier)
- **Total**: ~$15-20/month

### With Option A (Warmup)
- **Timer executions**: 120/month (unchanged)
- **Warmup executions**: ~30/month (once per cold start)
- **Additional cost**: $0 (within free tier)
- **Total**: ~$15-20/month (unchanged)

### With Option B (Hourly Refresh)
- **Timer executions**: 24/day × 30 days = 720/month
- **Additional cost**: ~$1-2/month
- **Total**: ~$16-22/month

**Conclusion**: Option A adds zero cost while providing the best user experience.

---

## Alternative: Lazy Loading with Cache

For ultra-low-cost deployments, consider lazy loading:

```javascript
// In updates handler
export async function getUpdates(request, context) {
  let updates = await getItemsFromDB();
  
  if (updates.length === 0) {
    // Database empty - fetch on demand
    context.log('Database empty, fetching updates on demand');
    await fetchUpdates(null, context, { daysBack: 7 });
    updates = await getItemsFromDB();
  }
  
  return { jsonBody: updates };
}
```

**Trade-off**: First request takes 5-10 seconds, but eliminates all pre-fetch overhead.

---

## Conclusion

**For the Azure Updates Portal, Option A (Cold Start Pre-fetch with Smart Detection) is recommended** because:

1. **Zero additional cost** - No extra function executions
2. **Best user experience** - Data ready immediately
3. **Simple implementation** - Uses existing functions
4. **Low maintenance** - No complex scheduling
5. **Production-proven** - Azure Functions warmup trigger is battle-tested

The hybrid approach of checking if the database is empty on first run provides the perfect balance of performance, cost, and simplicity.
