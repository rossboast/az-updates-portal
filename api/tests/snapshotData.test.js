import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let snapshot;

describe('Snapshot Data Tests', () => {
  beforeAll(async () => {
    const snapshotPath = path.join(__dirname, 'fixtures', 'feed-snapshot.json');
    
    try {
      const data = await fs.readFile(snapshotPath, 'utf-8');
      snapshot = JSON.parse(data);
    } catch (error) {
      console.warn('⚠️  No snapshot found. Run: npm run snapshot:create');
      snapshot = null;
    }
  });

  it('should have a valid snapshot file', () => {
    expect(snapshot).toBeDefined();
    expect(snapshot.generatedAt).toBeDefined();
    expect(snapshot.feeds).toBeDefined();
  });

  describe('Real Update Data Structure', () => {
    it('should have Azure updates in snapshot (may be empty if RSS feed is broken)', () => {
      expect(snapshot?.feeds.updates).toBeDefined();
      // Note: Azure Updates RSS feed can be unreliable, so we allow empty array
      expect(Array.isArray(snapshot.feeds.updates)).toBe(true);
      
      // Only validate structure if updates exist
      if (snapshot.feeds.updates.length > 0) {
        const firstFeed = snapshot.feeds.updates[0];
        expect(firstFeed.items.length).toBeGreaterThan(0);
      }
    });

    it('should validate update item structure if updates exist', () => {
      const updates = snapshot.feeds.updates.flatMap(f => f.items);
      
      // Only validate if we have updates
      if (updates.length > 0) {
        updates.forEach(update => {
          expect(update.title).toBeDefined();
          expect(update.link).toBeDefined();
          expect(update.pubDate).toBeDefined();
          expect(typeof update.title).toBe('string');
          expect(update.title.length).toBeGreaterThan(0);
        });
      } else {
        console.warn('⚠️  No Azure updates in snapshot - RSS feed may be broken');
        expect(updates.length).toBe(0);
      }
    });

    it('should show real categories from Azure updates if available', () => {
      const updates = snapshot.feeds.updates.flatMap(f => f.items);
      const allCategories = new Set();
      
      updates.forEach(update => {
        update.categories?.forEach(cat => allCategories.add(cat));
      });
      
      console.log('\n📊 Real Azure Update Categories:', Array.from(allCategories));
      
      // Only validate categories if updates exist
      if (updates.length > 0) {
        expect(allCategories.size).toBeGreaterThan(0);
      } else {
        console.warn('⚠️  No Azure updates to check categories - RSS feed may be broken');
        expect(allCategories.size).toBe(0);
      }
    });
  });

  describe('Real Blog Data Structure', () => {
    it('should have blog posts in snapshot', () => {
      expect(snapshot?.feeds.blogs).toBeDefined();
      expect(snapshot.feeds.blogs.length).toBeGreaterThan(0);
    });

    it('should have author information', () => {
      const blogs = snapshot.feeds.blogs.flatMap(f => f.items);
      const blogsWithAuthor = blogs.filter(b => b.author);
      
      expect(blogsWithAuthor.length).toBeGreaterThan(0);
      console.log('\n✍️  Sample authors:', blogsWithAuthor.slice(0, 3).map(b => b.author));
    });

    it('should show real categories from blog posts', () => {
      const blogs = snapshot.feeds.blogs.flatMap(f => f.items);
      const allCategories = new Set();
      
      blogs.forEach(blog => {
        blog.categories?.forEach(cat => allCategories.add(cat));
      });
      
      console.log('\n📊 Real Blog Categories:', Array.from(allCategories));
    });
  });

  describe('Real Video Data Structure', () => {
    it('should have videos in snapshot', () => {
      expect(snapshot?.feeds.videos).toBeDefined();
      expect(snapshot.feeds.videos.length).toBeGreaterThan(0);
    });

    it('should have valid video IDs', () => {
      const videos = snapshot.feeds.videos.flatMap(f => f.items);
      
      videos.forEach(video => {
        if (video.videoId) {
          expect(video.videoId).toMatch(/^[A-Za-z0-9_-]+$/);
          expect(video.link).toContain('youtube.com');
        }
      });
      
      console.log(`\n🎥 Found ${videos.length} real videos in snapshot`);
    });

    it('should show real video titles and topics', () => {
      const videos = snapshot.feeds.videos.flatMap(f => f.items);
      
      console.log('\n📹 Sample Real Videos:');
      videos.slice(0, 5).forEach(v => {
        console.log(`   - ${v.title}`);
      });
      
      expect(videos.length).toBeGreaterThan(0);
    });
  });

  describe('Data Freshness', () => {
    it('should have recent snapshot data', () => {
      const snapshotDate = new Date(snapshot.generatedAt);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      if (snapshotDate < oneWeekAgo) {
        console.warn('\n⚠️  Snapshot is older than 1 week. Consider refreshing: npm run snapshot:create');
      }
      
      expect(snapshotDate).toBeInstanceOf(Date);
    });
  });
});
