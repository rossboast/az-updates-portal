# Local Development Guide

This guide explains how to run the Azure Updates Portal locally on your development machine without requiring Azure resources.

## Quick Start

### 1. Start the API (Azure Functions)

```bash
cd api
npm install
npm start
```

The API will start on `http://localhost:7071` with **mock data enabled** by default.

### 2. Start the Web App (Vue.js)

In a separate terminal:

```bash
cd web
npm install
npm run dev
```

The web app will start on `http://localhost:5173` and proxy API requests to the Functions backend.

### 3. Access the Portal

Open your browser to `http://localhost:5173` and you'll see the portal with sample data!

## Mock Data Mode

By default, the API runs in **mock data mode** for local development. This means:

- ✅ No Azure subscription required
- ✅ No CosmosDB setup needed
- ✅ 6 sample updates/blogs for testing
- ✅ All filtering and search features work
- ✅ Perfect for UI development and testing

### Mock Data Includes:
- Azure OpenAI Service announcement
- Azure Functions Flex Consumption update
- Vue.js + Azure blog post
- Container Apps features
- Azure SDK for JavaScript guide
- Integration Services connectors

## Configuration Files

### API Configuration: `api/local.settings.json`

The API automatically uses the `local.settings.json` file. A template is provided:

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "USE_MOCK_DATA": "true",
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

**Key Settings:**
- `USE_MOCK_DATA: "true"` - Forces mock data mode
- `COSMOS_ENDPOINT: ""` - Empty means no CosmosDB connection
- `CORS: "*"` - Allows requests from the web app

### Web Configuration: `web/.env`

Optionally create a `.env` file to customize the API URL:

```bash
VITE_API_URL=http://localhost:7071/api
```

By default, the web app proxies `/api` requests to `http://localhost:7071`.

## Testing the Full Stack

### Test API Endpoints

**Get all updates:**
```bash
curl http://localhost:7071/api/updates
```

**Get categories:**
```bash
curl http://localhost:7071/api/categories
```

**Filter by category:**
```bash
curl http://localhost:7071/api/updates/category/AI
```

### Test the Web UI

1. **Search**: Type "Azure" in the search box
2. **Filter by Type**: Click "Blog" to see only blog posts
3. **Filter by Category**: Click "AI" to see AI-related content
4. **Click through**: Click "Read More" to open original articles

## Advanced: Connect to Real CosmosDB

If you want to test with real CosmosDB data locally:

### Option 1: Azure CosmosDB Emulator (Windows only)

1. Install [CosmosDB Emulator](https://aka.ms/cosmosdb-emulator)
2. Start the emulator
3. Update `api/local.settings.json`:
   ```json
   {
     "USE_MOCK_DATA": "false",
     "COSMOS_ENDPOINT": "https://localhost:8081"
   }
   ```

### Option 2: Azure CosmosDB in the Cloud

1. Deploy CosmosDB using `azd provision` (infrastructure only)
2. Get the endpoint from Azure Portal
3. Update `api/local.settings.json`:
   ```json
   {
     "USE_MOCK_DATA": "false",
     "COSMOS_ENDPOINT": "https://your-cosmos-account.documents.azure.com:443/"
   }
   ```
4. Authenticate with Azure CLI:
   ```bash
   az login
   ```

The Functions app will use your Azure credentials to connect.

## Why Mock Data Mode?

Mock data mode provides several benefits for local development:

1. **Zero Azure Dependencies**: Start coding immediately without Azure setup
2. **Fast Iteration**: No network latency, instant responses
3. **Predictable Data**: Same test data every time
4. **Cost-Free**: No Azure charges during development
5. **Offline Work**: Develop without internet connection

## Working with Real Data Locally

### Option 1: Mock Data (Default)

Perfect for UI development without network requests - uses hardcoded sample data.

**Configuration in `api/local.settings.json`:**

```json
{
  "DATA_MODE": "mock"
}
```

**Features:**

- 8 hardcoded sample items (updates, blogs, videos)
- Instant startup
- No dependencies

### Option 2: Snapshot Data (Real RSS Feed Cache)

Run the application with **cached real data** from Azure RSS feeds! 🎉

**Step 1: Create snapshot:**

```bash
cd api
npm run snapshot:create
```

**Step 2: Configure to use snapshot:**

Update `api/local.settings.json`:

```json
{
  "DATA_MODE": "snapshot"
}
```

**Step 3: Restart API:**

```bash
cd api
npm start
```

**Step 4: View in browser:**

Open `http://localhost:5173` - you'll see **real Azure content**! ✨

**What you get:**
- ✅ Real blog posts from Azure blogs
- ✅ Real YouTube videos from Microsoft events
- ✅ Real categories (AI + machine learning, Azure SDK, etc.)
- ✅ Real authors and publication dates
- ✅ No network latency (cached locally)
- ✅ Reproducible data

**When to use:**
- UI development with realistic data
- Testing category filters with real categories
- Demos with current Azure content
- Development without internet connection

### Option 3: Live CosmosDB

Connect to real Azure CosmosDB:

1. **Configure live mode** in `local.settings.json`:

   ```json
   {
     "DATA_MODE": "live",
     "COSMOS_ENDPOINT": "https://your-account.documents.azure.com:443/"
   }
   ```

   ⚠️ **Note:** `DATA_MODE: "live"` requires a valid `COSMOS_ENDPOINT`

2. **Authenticate with Azure:**

   ```bash
   az login
   ```

3. **Benefits:**

   - Production-like testing
   - Full CosmosDB features
   - Real-time data updates

## Understanding Real Data Structure

### Discover Real Categories

```bash
cd api
npm run snapshot:create
npm run test:snapshot
```

Check console output for:

- 📊 Real Azure Update Categories
- 📊 Real Blog Categories
- 🎥 Real video titles

### Inspect Snapshot File

```bash
cat api/tests/fixtures/feed-snapshot.json
```

Use this to:

- Plan UI filter options
- Update mock data realism
- Validate category assumptions
- Understand RSS feed structure

## Troubleshooting

### API won't start

**Error: "Cannot find module '@azure/functions'"**
```bash
cd api
npm install
```

**Error: "Port 7071 already in use"**
```bash
# Kill the existing process
npx kill-port 7071
# Or change the port in local.settings.json
```

### Web app shows "Failed to fetch updates"

**Check the API is running:**
```bash
curl http://localhost:7071/api/updates
```

**Check CORS in API logs:**
Look for CORS errors in the Functions terminal. The `local.settings.json` should have `"CORS": "*"`.

### Mock data not appearing

**Verify USE_MOCK_DATA setting:**
Check `api/local.settings.json` has `"USE_MOCK_DATA": "true"`.

**Check API logs:**
You should see "Using mock data for local development" in the Functions terminal.

### Web app shows blank page

**Check browser console:**
Open DevTools (F12) and look for JavaScript errors.

**Rebuild the web app:**
```bash
cd web
rm -rf node_modules dist
npm install
npm run dev
```

## Development Workflow

### Making Changes

1. **API Changes**: Edit files in `api/src/`, Functions auto-reload
2. **Web Changes**: Edit files in `web/src/`, Vite hot-reloads
3. **Add Mock Data**: Edit `api/src/lib/cosmosClient.js` `mockUpdates` array

### Testing Changes

```bash
# Test API
curl http://localhost:7071/api/updates

# Test web in browser
# Open http://localhost:5173
```

### Adding New Mock Data

Edit `api/src/lib/cosmosClient.js`:

```javascript
const mockUpdates = [
  // ... existing items
  {
    id: 'mock-7',
    title: 'Your New Update',
    description: 'Description here',
    link: 'https://example.com',
    publishedDate: new Date().toISOString(),
    source: 'Test Source',
    type: 'update',
    categories: ['Test', 'Azure']
  }
];
```

Restart the API to see changes.

## Next Steps

- **Customize the UI**: Edit `web/src/style.css` for colors and layout
- **Add Features**: Create new components in `web/src/components/`
- **Extend the API**: Add new endpoints in `api/src/handlers/`
- **Deploy to Azure**: Run `azd up` when ready to deploy

## Related Documentation

- [README.md](README.md) - Project overview
- [QUICKSTART.md](QUICKSTART.md) - Deployment guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details
- [API.md](API.md) - API reference

---

**Happy coding!** 🚀

For questions, open an issue on GitHub.
