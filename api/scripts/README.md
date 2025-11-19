# API Scripts

This directory contains utility scripts for the Azure Updates Portal API.

## Available Scripts

### fetchDataSnapshot.js

Creates a snapshot of real RSS feed data for testing and development.

**Usage:**

```bash
npm run snapshot:create
```

**What it does:**

- Fetches the latest 5 items from each RSS feed:
  - Azure Updates feed
  - Azure Blog feeds
  - YouTube event video feeds
- Saves the data to `tests/fixtures/feed-snapshot.json`
- Provides a summary of items fetched

**When to use:**

- Weekly to keep test data current
- Before major category changes
- When adding new RSS feeds
- To understand real data structure

**Output:**

The snapshot file includes:
- Timestamp of when data was fetched
- Feed metadata (URL, name, type)
- Sample items with all fields (title, description, categories, etc.)

**Example output:**

```text
📸 Fetching real data snapshots from RSS feeds...

📰 Fetching Azure Updates...
Fetching Azure Updates...

📝 Fetching Blog Posts...
Fetching Azure Blog...
Fetching Azure SDK Blog...

🎥 Fetching Event Videos...
Fetching Microsoft Azure YouTube...

✅ Snapshot saved to: /path/to/tests/fixtures/feed-snapshot.json

Summary:
  - Updates: 5 items
  - Blogs: 10 items
  - Videos: 5 items
```

## Adding New Scripts

1. Create a new `.js` file in this directory
2. Add it to `package.json` scripts section
3. Document it in this README
