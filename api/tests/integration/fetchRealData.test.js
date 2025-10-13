import { describe, it, expect } from 'vitest';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['dc:creator', 'creator'],
      ['yt:videoId', 'videoId']
    ]
  }
});

describe('Integration Tests - Real RSS Feeds', () => {
  // Increase timeout for network requests
  const TIMEOUT = 30000;

  describe('Azure Updates Feed', () => {
    it('should fetch and parse Azure updates', async () => {
      const feed = await parser.parseURL('https://azure.microsoft.com/en-us/updates/feed/');
      
      expect(feed).toBeDefined();
      expect(feed.items).toBeDefined();
      expect(feed.items.length).toBeGreaterThan(0);
      
      const firstItem = feed.items[0];
      expect(firstItem.title).toBeDefined();
      expect(firstItem.link).toBeDefined();
      expect(firstItem.pubDate || firstItem.isoDate).toBeDefined();
    }, TIMEOUT);

    it('should have valid categories in real data', async () => {
      const feed = await parser.parseURL('https://azure.microsoft.com/en-us/updates/feed/');
      
      const itemsWithCategories = feed.items.filter(item => item.categories?.length > 0);
      expect(itemsWithCategories.length).toBeGreaterThan(0);
      
      // Log categories to understand real data structure
      const categories = new Set();
      itemsWithCategories.forEach(item => {
        item.categories?.forEach(cat => categories.add(cat));
      });
      
      console.log('Real Azure Update categories:', Array.from(categories));
      expect(categories.size).toBeGreaterThan(0);
    }, TIMEOUT);
  });

  describe('Azure Blog Feeds', () => {
    it('should fetch main Azure blog', async () => {
      const feed = await parser.parseURL('https://azure.microsoft.com/en-us/blog/feed/');
      
      expect(feed).toBeDefined();
      expect(feed.items.length).toBeGreaterThan(0);
      
      const firstItem = feed.items[0];
      expect(firstItem.title).toBeDefined();
      expect(firstItem.contentSnippet || firstItem.content).toBeDefined();
    }, TIMEOUT);

    it('should fetch Azure SDK blog', async () => {
      const feed = await parser.parseURL('https://devblogs.microsoft.com/azure-sdk/feed/');
      
      expect(feed).toBeDefined();
      expect(feed.items.length).toBeGreaterThan(0);
    }, TIMEOUT);

    it('should extract author information', async () => {
      const feed = await parser.parseURL('https://azure.microsoft.com/en-us/blog/feed/');
      
      const itemsWithAuthor = feed.items.filter(item => item.creator || item.author);
      expect(itemsWithAuthor.length).toBeGreaterThan(0);
      
      console.log('Sample authors:', itemsWithAuthor.slice(0, 3).map(i => i.creator || i.author));
    }, TIMEOUT);
  });

  describe('YouTube Event Videos Feed', () => {
    it('should fetch Microsoft Azure YouTube channel', async () => {
      const feed = await parser.parseURL(
        'https://www.youtube.com/feeds/videos.xml?channel_id=UCrhJmfAGQ5K81XQ8_od1iTg'
      );
      
      expect(feed).toBeDefined();
      expect(feed.items.length).toBeGreaterThan(0);
      
      const firstVideo = feed.items[0];
      expect(firstVideo.title).toBeDefined();
      expect(firstVideo.link).toBeDefined();
      expect(firstVideo.videoId).toBeDefined();
      
      console.log('Sample video:', {
        title: firstVideo.title,
        videoId: firstVideo.videoId,
        published: firstVideo.pubDate
      });
    }, TIMEOUT);

    it('should have valid video structure', async () => {
      const feed = await parser.parseURL(
        'https://www.youtube.com/feeds/videos.xml?channel_id=UCrhJmfAGQ5K81XQ8_od1iTg'
      );
      
      feed.items.forEach(item => {
        expect(item.videoId).toBeDefined();
        expect(item.videoId).toMatch(/^[A-Za-z0-9_-]+$/);
        expect(item.link).toContain('youtube.com');
      });
    }, TIMEOUT);
  });

  describe('Data Quality Validation', () => {
    it('should verify all feeds return recent content', async () => {
      const feeds = [
        'https://azure.microsoft.com/en-us/updates/feed/',
        'https://azure.microsoft.com/en-us/blog/feed/',
        'https://www.youtube.com/feeds/videos.xml?channel_id=UCrhJmfAGQ5K81XQ8_od1iTg'
      ];
      
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      for (const feedUrl of feeds) {
        const feed = await parser.parseURL(feedUrl);
        const recentItems = feed.items.filter(item => {
          const pubDate = new Date(item.pubDate || item.isoDate);
          return pubDate >= oneMonthAgo;
        });
        
        expect(recentItems.length).toBeGreaterThan(0);
        console.log(`${feedUrl}: ${recentItems.length} items in last 30 days`);
      }
    }, TIMEOUT);
  });
});
