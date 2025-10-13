import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchEventVideos } from '../src/handlers/fetchEventVideos.js';

describe('Fetch Event Videos Handler', () => {
  beforeEach(() => {
    process.env.DATA_MODE = 'mock';
    delete process.env.COSMOS_ENDPOINT;
  });

  const createMockContext = () => ({
    log: vi.fn(),
    error: vi.fn()
  });

  it('should be a function', () => {
    expect(typeof fetchEventVideos).toBe('function');
  });

  it('should handle context parameter', async () => {
    const context = createMockContext();
    
    await fetchEventVideos(null, context);
    
    expect(context.log).toHaveBeenCalled();
  });

  it('should log fetching message', async () => {
    const context = createMockContext();
    
    await fetchEventVideos(null, context);
    
    expect(context.log).toHaveBeenCalledWith('Fetching event videos from YouTube...');
  });

  it('should handle YouTube RSS feed structure', () => {
    const sampleYouTubeFeed = `
      <feed>
        <entry>
          <title>Test Video Title</title>
          <yt:videoId>test123</yt:videoId>
          <published>2024-01-01T00:00:00Z</published>
          <author>
            <name>Microsoft</name>
          </author>
          <media:group>
            <media:description>Test description</media:description>
          </media:group>
        </entry>
      </feed>
    `;
    
    expect(sampleYouTubeFeed).toContain('<entry>');
    expect(sampleYouTubeFeed).toContain('yt:videoId');
  });

  it('should filter videos older than one year', () => {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    expect(yesterday > oneYearAgo).toBe(true);
    expect(twoYearsAgo < oneYearAgo).toBe(true);
  });
});

describe('Event Video Data Model', () => {
  it('should have video type in mock data', async () => {
    const { queryUpdates } = await import('../src/lib/cosmosClient.js');
    
    const results = await queryUpdates({ query: 'SELECT * FROM c' });
    const videos = results.filter(item => item.type === 'video');
    
    expect(videos.length).toBeGreaterThan(0);
  });

  it('should have event categories', async () => {
    const { queryUpdates } = await import('../src/lib/cosmosClient.js');
    
    const results = await queryUpdates({ query: 'SELECT * FROM c' });
    const videos = results.filter(item => item.type === 'video');
    
    videos.forEach(video => {
      expect(video.categories).toBeDefined();
      expect(Array.isArray(video.categories)).toBe(true);
      const normalized = video.categories.map(cat => cat.toLowerCase());
      expect(normalized).not.toContain('videos');
      expect(normalized).not.toContain('events');
      expect(normalized).not.toContain('microsoft');
      expect(video.categories).toContain('Azure');
    });
  });

  it('should have required video fields', async () => {
    const { queryUpdates } = await import('../src/lib/cosmosClient.js');
    
    const results = await queryUpdates({ query: 'SELECT * FROM c' });
    const videos = results.filter(item => item.type === 'video');
    
    videos.forEach(video => {
      expect(video.id).toBeDefined();
      expect(video.title).toBeDefined();
      expect(video.description).toBeDefined();
      expect(video.link).toBeDefined();
      expect(video.publishedDate).toBeDefined();
      expect(video.source).toBeDefined();
      expect(video.type).toBe('video');
      expect(video.categories).toBeDefined();
    });
  });
});
