import { describe, it, expect } from 'vitest';
import Parser from 'rss-parser';

describe('RSS Parser Library Integration', () => {
  const parser = new Parser({
    customFields: {
      item: ['dc:creator', 'author']
    }
  });

  describe('RSS 2.0 Feed Parsing', () => {
    it('should parse standard RSS 2.0 feed', async () => {
      const rss = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Feed</title>
            <item>
              <title>Test Post</title>
              <link>https://example.com/post1</link>
              <description>Test description</description>
              <pubDate>Mon, 07 Oct 2024 12:00:00 GMT</pubDate>
              <guid>https://example.com/post1</guid>
              <category>Technology</category>
            </item>
          </channel>
        </rss>`;
      
      const feed = await parser.parseString(rss);
      
      expect(feed.items).toHaveLength(1);
      expect(feed.items[0].title).toBe('Test Post');
      expect(feed.items[0].link).toBe('https://example.com/post1');
      expect(feed.items[0].contentSnippet).toBe('Test description');
      expect(feed.items[0].guid).toBe('https://example.com/post1');
    });

    it('should handle CDATA in RSS fields', async () => {
      const rss = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Feed</title>
            <item>
              <title><![CDATA[Post with <special> characters]]></title>
              <link>https://example.com/post2</link>
              <description><![CDATA[Description with <HTML> tags]]></description>
            </item>
          </channel>
        </rss>`;
      
      const feed = await parser.parseString(rss);
      
      expect(feed.items[0].title).toBe('Post with <special> characters');
      expect(feed.items[0].link).toBe('https://example.com/post2');
    });
  });

  describe('Atom Feed Parsing', () => {
    it('should parse Atom feed format', async () => {
      const atom = `<?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <title>Test Atom Feed</title>
          <entry>
            <title>Atom Post</title>
            <link href="https://example.com/atom-post" rel="alternate"/>
            <id>https://example.com/atom-post</id>
            <summary>Atom description</summary>
            <published>2024-10-07T12:00:00Z</published>
          </entry>
        </feed>`;
      
      const feed = await parser.parseString(atom);
      
      expect(feed.items).toHaveLength(1);
      expect(feed.items[0].title).toBe('Atom Post');
      expect(feed.items[0].link).toBe('https://example.com/atom-post');
      expect(feed.items[0].id).toBe('https://example.com/atom-post');
    });

    it('should extract link from Atom href attribute', async () => {
      const atom = `<?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Test</title>
            <link href="https://devblogs.microsoft.com/azure-sdk/test" rel="alternate" type="text/html"/>
          </entry>
        </feed>`;
      
      const feed = await parser.parseString(atom);
      
      expect(feed.items[0].link).toBe('https://devblogs.microsoft.com/azure-sdk/test');
    });
  });

  describe('Data Field Mapping', () => {
    it('should provide date in multiple formats', async () => {
      const rss = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Test</title>
              <link>https://example.com/test</link>
              <pubDate>Mon, 07 Oct 2024 12:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;
      
      const feed = await parser.parseString(rss);
      const item = feed.items[0];
      
      expect(item.pubDate).toBeDefined();
      expect(item.isoDate).toBeDefined();
      expect(new Date(item.isoDate)).toBeInstanceOf(Date);
    });

    it('should extract custom fields', async () => {
      const rss = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
          <channel>
            <item>
              <title>Test</title>
              <link>https://example.com/test</link>
              <dc:creator>John Doe</dc:creator>
            </item>
          </channel>
        </rss>`;
      
      const feed = await parser.parseString(rss);
      
      expect(feed.items[0]['dc:creator']).toBe('John Doe');
    });

    it('should extract categories as array', async () => {
      const rss = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Test</title>
              <link>https://example.com/test</link>
              <category>Azure</category>
              <category>Cloud</category>
            </item>
          </channel>
        </rss>`;
      
      const feed = await parser.parseString(rss);
      
      expect(feed.items[0].categories).toContain('Azure');
      expect(feed.items[0].categories).toContain('Cloud');
    });
  });

  describe('Edge Cases', () => {
    it('should handle feed with no items', async () => {
      const rss = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Empty Feed</title>
          </channel>
        </rss>`;
      
      const feed = await parser.parseString(rss);
      
      expect(feed.items).toHaveLength(0);
    });

    it('should handle missing optional fields gracefully', async () => {
      const rss = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Minimal Post</title>
              <link>https://example.com/minimal</link>
            </item>
          </channel>
        </rss>`;
      
      const feed = await parser.parseString(rss);
      const item = feed.items[0];
      
      expect(item.title).toBe('Minimal Post');
      expect(item.link).toBe('https://example.com/minimal');
      expect(item.categories).toBeUndefined();
    });
  });
});
