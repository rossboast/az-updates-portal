import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
  customFields: {
    item: [
      ['dc:creator', 'creator'],
      ['yt:videoId', 'videoId'],
      ['yt:channelId', 'channelId']
    ]
  }
});

const FEEDS = {
  updates: [
    { url: 'https://azure.microsoft.com/en-us/updates/feed/', name: 'Azure Updates' }
  ],
  blogs: [
    { url: 'https://azure.microsoft.com/en-us/blog/feed/', name: 'Azure Blog' },
    { url: 'https://devblogs.microsoft.com/azure-sdk/feed/', name: 'Azure SDK Blog' }
  ],
  videos: [
    { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCrhJmfAGQ5K81XQ8_od1iTg', name: 'Microsoft Azure YouTube' }
  ]
};

async function fetchFeedSnapshot(feed, type) {
  console.log(`Fetching ${feed.name}...`);
  try {
    const feedData = await parser.parseURL(feed.url);
    
    // Take first 5 items from each feed
    const items = feedData.items.slice(0, 5).map(item => ({
      title: item.title,
      description: item.contentSnippet || item.content || '',
      link: item.link,
      pubDate: item.pubDate || item.isoDate,
      author: item.creator || item.author || '',
      categories: item.categories || [],
      videoId: item.videoId || null,
      guid: item.guid || item.link
    }));
    
    return {
      feedUrl: feed.url,
      feedName: feed.name,
      type,
      fetchedAt: new Date().toISOString(),
      itemCount: items.length,
      items
    };
  } catch (error) {
    console.error(`Error fetching ${feed.name}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('📸 Fetching real data snapshots from RSS feeds...\n');
  
  const snapshot = {
    generatedAt: new Date().toISOString(),
    feeds: {}
  };
  
  // Fetch updates
  console.log('\n📰 Fetching Azure Updates...');
  snapshot.feeds.updates = [];
  for (const feed of FEEDS.updates) {
    const data = await fetchFeedSnapshot(feed, 'update');
    if (data) snapshot.feeds.updates.push(data);
  }
  
  // Fetch blogs
  console.log('\n📝 Fetching Blog Posts...');
  snapshot.feeds.blogs = [];
  for (const feed of FEEDS.blogs) {
    const data = await fetchFeedSnapshot(feed, 'blog');
    if (data) snapshot.feeds.blogs.push(data);
  }
  
  // Fetch videos
  console.log('\n🎥 Fetching Event Videos...');
  snapshot.feeds.videos = [];
  for (const feed of FEEDS.videos) {
    const data = await fetchFeedSnapshot(feed, 'video');
    if (data) snapshot.feeds.videos.push(data);
  }
  
  // Save snapshot
  const snapshotPath = path.join(__dirname, '..', 'tests', 'fixtures', 'feed-snapshot.json');
  await fs.mkdir(path.dirname(snapshotPath), { recursive: true });
  await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2));
  
  console.log(`\n✅ Snapshot saved to: ${snapshotPath}`);
  console.log(`\nSummary:`);
  console.log(`  - Updates: ${snapshot.feeds.updates.reduce((sum, f) => sum + f.itemCount, 0)} items`);
  console.log(`  - Blogs: ${snapshot.feeds.blogs.reduce((sum, f) => sum + f.itemCount, 0)} items`);
  console.log(`  - Videos: ${snapshot.feeds.videos.reduce((sum, f) => sum + f.itemCount, 0)} items`);
}

main().catch(console.error);
