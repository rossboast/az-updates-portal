# Snapshot Data Mode Configuration

To run the application with **real cached RSS feed data** instead of mock data:

## Quick Start

### 1. Create the snapshot

```bash
cd api
npm run snapshot:create
```

This fetches real data from Azure RSS feeds and caches it locally.

### 2. Configure snapshot mode

Create or update `api/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "DATA_MODE": "snapshot",
    "COSMOS_ENDPOINT": "",
    "COSMOS_DATABASE_NAME": "AzureUpdatesDB",
    "COSMOS_CONTAINER_NAME": "Updates"
  },
  "Host": {
    "CORS": "*",
    "LocalHttpPort": 7071
  }
}
```

**Key setting:**
- `DATA_MODE: "snapshot"` - Use cached real data from RSS feeds

**Valid DATA_MODE values:**
- `mock` - Hardcoded sample data (default)
- `snapshot` - Cached real RSS feed data
- `live` - Connect to Azure CosmosDB (requires COSMOS_ENDPOINT)

### 3. Start the API

```bash
cd api
npm start
```

You should see:
```
Using snapshot data for local development
Loaded 20 items from snapshot data
```

### 4. Start the web app

In another terminal:

```bash
cd web
npm run dev
```

### 5. View real data

Open http://localhost:5173

You'll see:
- ✅ Real blog posts from Azure
- ✅ Real YouTube videos  
- ✅ Real categories like "AI + machine learning", "Azure SDK", "Large language models (LLMs)"
- ✅ Real authors and dates

## Data Modes Comparison

| Mode | Setting | Data Source | Items | Categories |
|------|---------|-------------|-------|------------|
| **Mock** | `DATA_MODE: "mock"` | Hardcoded | 8 | Generic (AI, Azure, Compute) |
| **Snapshot** | `DATA_MODE: "snapshot"` | Cached RSS feeds | 15-20 | Real (AI + machine learning, etc.) |
| **Live CosmosDB** | `DATA_MODE: "live"` + `COSMOS_ENDPOINT` | Azure CosmosDB | Many | Real from production |

## Refreshing Snapshot Data

Update the cached data weekly:

```bash
cd api
npm run snapshot:refresh
```

This fetches new data and runs tests to validate it.

## Benefits of Snapshot Mode

1. **Realistic UI development** - See how real categories appear
2. **Test real data structures** - Validate parsing and display
3. **Offline development** - No network requests after initial fetch
4. **Consistent data** - Same data across team members
5. **Preview current content** - See what's actually in Azure feeds

## Switching Between Modes

Update `api/local.settings.json` and restart the API:

**Mock mode:**
```json
{
  "DATA_MODE": "mock"
}
```

**Snapshot mode:**
```json
{
  "DATA_MODE": "snapshot"
}
```

**Live mode (requires CosmosDB):**
```json
{
  "DATA_MODE": "live",
  "COSMOS_ENDPOINT": "https://your-account.documents.azure.com:443/"
}
```

## Validation

The system validates:
- ✅ `DATA_MODE` must be `mock`, `snapshot`, or `live`
- ✅ `DATA_MODE: "live"` requires a valid `COSMOS_ENDPOINT`
- ✅ Invalid modes default to `mock` with a warning
