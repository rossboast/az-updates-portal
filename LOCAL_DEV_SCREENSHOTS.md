# Local Development - Visual Guide

This guide shows what you'll see when running the Azure Updates Portal locally.

## Starting the API

When you run `npm start` in the `api` directory:

```
$ cd api
$ npm start

> azure-updates-portal-api@1.0.0 start
> func start

Azure Functions Core Tools
Core Tools Version:       4.x.x
Function Runtime Version: 4.x.x

Functions:

        getCategories: [GET] http://localhost:7071/api/categories
        
        getUpdates: [GET] http://localhost:7071/api/updates
        
        getUpdatesByCategory: [GET] http://localhost:7071/api/updates/category/{category}

Using mock data for local development
```

**What You'll See:**
- ✅ Three HTTP endpoints ready
- ✅ "Using mock data for local development" message
- ✅ No errors about missing CosmosDB
- ✅ API responds instantly with sample data

## Testing the API

### Get All Updates
```bash
$ curl http://localhost:7071/api/updates

[
  {
    "id": "mock-1",
    "title": "Azure OpenAI Service Now Generally Available",
    "description": "Azure OpenAI Service brings advanced AI capabilities...",
    "link": "https://azure.microsoft.com/updates/azure-openai-ga",
    "publishedDate": "2024-10-06T17:12:00.000Z",
    "source": "Azure Updates",
    "type": "update",
    "categories": ["AI", "Azure", "Cognitive Services"]
  },
  {
    "id": "mock-2",
    "title": "New Azure Functions Flex Consumption Plan",
    ...
  }
]
```

### Get Categories
```bash
$ curl http://localhost:7071/api/categories

[
  "AI",
  "Azure",
  "Cognitive Services",
  "Compute",
  "Azure Functions",
  "Serverless",
  "Development",
  "Web Development",
  "Containers",
  "SDK",
  "JavaScript",
  "Integration",
  "Logic Apps"
]
```

### Filter by Category
```bash
$ curl http://localhost:7071/api/updates/category/AI

[
  {
    "id": "mock-1",
    "title": "Azure OpenAI Service Now Generally Available",
    "categories": ["AI", "Azure", "Cognitive Services"]
  }
]
```

## Starting the Web App

When you run `npm run dev` in the `web` directory:

```
$ cd web
$ npm run dev

  VITE v5.4.20  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**What You'll See:**
- ✅ Development server starts on port 5173
- ✅ Hot module replacement enabled
- ✅ Instant page updates when you edit files

## The Portal UI (localhost:5173)

### Header Section
```
┌────────────────────────────────────────────────────────┐
│  Azure Updates Portal                                  │
│  Stay up to date with the latest Azure announcements,  │
│  updates, and blog posts                               │
└────────────────────────────────────────────────────────┘
```

### Filters Section
```
┌────────────────────────────────────────────────────────┐
│  Search                                                │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Search updates...                                │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Type                                                  │
│  [All]  [Update]  [Blog]                              │
│                                                        │
│  Category                                              │
│  [All]  [AI]  [Azure]  [Compute]  [Development] ...   │
└────────────────────────────────────────────────────────┘
```

### Update Cards
```
┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
│ [update]                            │  │ [blog]                              │
│                                     │  │                                     │
│ Azure OpenAI Service Now            │  │ Building Modern Web Apps with       │
│ Generally Available                 │  │ Azure and Vue.js                    │
│                                     │  │                                     │
│ Azure Updates                       │  │ Azure Blog                          │
│                                     │  │                                     │
│ Azure OpenAI Service brings         │  │ Learn how to create scalable,       │
│ advanced AI capabilities to your    │  │ responsive web applications using   │
│ applications with GPT-4...          │  │ Vue.js 3 and Azure services...      │
│                                     │  │                                     │
│ [AI] [Azure] [Cognitive Services]   │  │ [Development] [Azure]               │
│                                     │  │                                     │
│ ─────────────────────────────────── │  │ ─────────────────────────────────── │
│ Oct 6, 2024        Read More →     │  │ Oct 4, 2024        Read More →     │
└─────────────────────────────────────┘  └─────────────────────────────────────┘
```

## Interactive Features

### 1. Search Functionality
**Type "Azure" in search box:**
- ✅ Cards filter instantly
- ✅ All 6 updates shown (all contain "Azure")
- ✅ No page reload

**Type "OpenAI":**
- ✅ Only 1 card shows
- ✅ Instant filtering

### 2. Type Filtering
**Click "Blog":**
- ✅ Shows 2 blog posts
- ✅ Button turns purple
- ✅ Update cards hidden

**Click "Update":**
- ✅ Shows 4 updates
- ✅ Blog posts hidden

### 3. Category Filtering
**Click "AI":**
- ✅ Shows 2 items with AI category
- ✅ Button highlighted
- ✅ Works with other filters

**Click "Compute":**
- ✅ Shows 3 compute-related items
- ✅ Different content displayed

### 4. Combined Filtering
**Select:**
- Type: "Blog"
- Category: "Development"
- Search: "Azure"

**Result:**
- ✅ Shows 1-2 matching items
- ✅ All filters apply simultaneously
- ✅ Instant updates

## Browser Console (DevTools F12)

### Successful API Calls
```
GET http://localhost:7071/api/updates?limit=100 200 OK (15ms)
GET http://localhost:7071/api/categories 200 OK (8ms)
```

### No Errors
```
✓ No CORS errors
✓ No 404 errors
✓ No JavaScript errors
✓ Clean console
```

## What You Can Test

### UI Features
- ✅ Responsive design (resize browser)
- ✅ Search with instant filtering
- ✅ Type buttons (All/Update/Blog)
- ✅ Category filters
- ✅ Card hover effects
- ✅ "Read More" links (open in new tab)
- ✅ Mobile layout (< 768px width)

### Data Features
- ✅ 6 sample updates/blogs
- ✅ Multiple categories per item
- ✅ Different sources
- ✅ Chronological sorting
- ✅ Variety of content types

### Development Features
- ✅ Hot module replacement
- ✅ Edit CSS - see instant changes
- ✅ Edit components - auto reload
- ✅ Edit mock data - restart API

## Editing Mock Data

Want to add more sample data? Edit `api/src/lib/cosmosClient.js`:

```javascript
const mockUpdates = [
  // ... existing items
  {
    id: 'mock-7',
    title: 'Your Custom Update Title',
    description: 'Your description here...',
    link: 'https://example.com/your-article',
    publishedDate: new Date().toISOString(),
    source: 'Custom Source',
    type: 'update',  // or 'blog'
    categories: ['Custom', 'Azure', 'Test']
  }
];
```

**Then restart the API:**
```bash
# Stop with Ctrl+C
# Start again
npm start
```

**Refresh the browser:**
- ✅ New item appears
- ✅ Category "Custom" in filters
- ✅ Works with all features

## Customizing the UI

### Change Colors

Edit `web/src/style.css`:

```css
body {
  /* Change gradient background */
  background: linear-gradient(135deg, #your-color1, #your-color2);
}

.filter-btn.active {
  /* Change button color */
  background: #your-brand-color;
}
```

**Save the file:**
- ✅ Vite hot-reloads instantly
- ✅ See changes immediately
- ✅ No page refresh needed

### Modify Layout

Edit `web/src/App.vue` or components:
- ✅ Changes appear instantly
- ✅ Vue DevTools available
- ✅ Component tree visible

## Troubleshooting Visual Guide

### Problem: "Failed to fetch updates"

**Browser shows:**
```
Error: Failed to fetch updates
(No update cards displayed)
```

**Solution:**
1. Check API terminal - should see "Using mock data"
2. Test API directly: `curl http://localhost:7071/api/updates`
3. Check browser console for CORS errors

### Problem: Blank Page

**Browser shows:**
```
(White screen, nothing visible)
```

**Solution:**
1. Open DevTools (F12)
2. Check Console tab for errors
3. Verify both API and web are running
4. Check Network tab for failed requests

### Problem: Port Already in Use

**Terminal shows:**
```
Error: Port 7071 is already in use
```

**Solution:**
```bash
# Kill the process
npx kill-port 7071

# Or use different port in local.settings.json
```

## Performance Notes

### Local Development Performance
- ✅ API response: < 10ms (mock data)
- ✅ Page load: < 1 second
- ✅ Filter updates: Instant
- ✅ Search: Real-time
- ✅ Hot reload: < 500ms

### Compared to Cloud
- 🚀 **Local:** Instant (no network)
- 🌐 **Azure:** 50-200ms (network latency)

## Next Steps

### Make Your Changes
1. **Edit UI**: Modify components, styles
2. **Add Features**: New filters, views
3. **Test Changes**: See them live instantly
4. **Add Mock Data**: More test scenarios

### Deploy to Azure
When ready:
```bash
azd up
```

Your local changes deploy to production!

## Related Docs

- [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) - Complete setup guide
- [COSMOSDB_RATIONALE.md](COSMOSDB_RATIONALE.md) - Why CosmosDB?
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [API.md](API.md) - API reference

---

**Happy local development!** 🚀
