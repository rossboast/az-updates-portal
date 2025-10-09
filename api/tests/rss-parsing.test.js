import { describe, it, expect } from 'vitest';

// Replicate the extractTag function from our handlers
function extractTag(text, tag) {
  // Special handling for link tags - they can appear in multiple formats
  if (tag === 'link') {
    // First, try to extract href attribute (Atom format): <link href="URL"/>
    const hrefRegex = /<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i;
    const hrefMatch = text.match(hrefRegex);
    if (hrefMatch && hrefMatch[1]) {
      return hrefMatch[1].trim();
    }
    
    // Fall through to standard extraction for RSS 2.0 format
  }
  
  // Standard tag extraction: <tag>content</tag>
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

describe('RSS Link Extraction', () => {
  describe('Standard RSS 2.0 Format', () => {
    it('should extract link from standard format', () => {
      const rss = `
        <item>
          <title>Test Post</title>
          <link>https://example.com/post1</link>
          <description>Description</description>
        </item>
      `;
      const link = extractTag(rss, 'link');
      expect(link).toBe('https://example.com/post1');
    });

    it('should extract link with CDATA in other fields', () => {
      const rss = `
        <item>
          <title><![CDATA[Test Post]]></title>
          <link>https://azure.microsoft.com/blog/test-post</link>
          <description><![CDATA[A test description]]></description>
        </item>
      `;
      const link = extractTag(rss, 'link');
      expect(link).toBe('https://azure.microsoft.com/blog/test-post');
    });

    it('should trim whitespace from links', () => {
      const rss = `
        <item>
          <link>
            https://example.com/post-with-whitespace
          </link>
        </item>
      `;
      const link = extractTag(rss, 'link');
      expect(link).toBe('https://example.com/post-with-whitespace');
    });
  });

  describe('Atom Format', () => {
    it('should extract href from self-closing link tag', () => {
      const atom = `
        <entry>
          <title>Test Post</title>
          <link href="https://example.com/atom-post" rel="alternate"/>
          <id>https://example.com/atom-post</id>
        </entry>
      `;
      const link = extractTag(atom, 'link');
      expect(link).toBe('https://example.com/atom-post');
    });

    it('should extract href from link tag with attributes', () => {
      const atom = `
        <entry>
          <link href="https://devblogs.microsoft.com/azure-sdk/post" rel="alternate" type="text/html"></link>
        </entry>
      `;
      const link = extractTag(atom, 'link');
      expect(link).toBe('https://devblogs.microsoft.com/azure-sdk/post');
    });

    it('should handle link with single quotes', () => {
      const atom = `
        <entry>
          <link href='https://example.com/single-quotes' rel='alternate'/>
        </entry>
      `;
      const link = extractTag(atom, 'link');
      expect(link).toBe('https://example.com/single-quotes');
    });
  });

  describe('Edge Cases', () => {
    it('should return empty string for missing link', () => {
      const rss = `
        <item>
          <title>Test Post</title>
          <description>No link here</description>
        </item>
      `;
      const link = extractTag(rss, 'link');
      expect(link).toBe('');
    });

    it('should return empty string for empty link tag', () => {
      const rss = `
        <item>
          <link></link>
        </item>
      `;
      const link = extractTag(rss, 'link');
      expect(link).toBe('');
    });

    it('should handle real Azure Updates RSS format', () => {
      const rss = `
        <item>
          <title>Azure OpenAI Service Update</title>
          <link>https://azure.microsoft.com/en-us/updates/azure-openai-service-update/</link>
          <description>New features available</description>
          <pubDate>Mon, 07 Oct 2024 12:00:00 GMT</pubDate>
          <guid>https://azure.microsoft.com/en-us/updates/azure-openai-service-update/</guid>
        </item>
      `;
      const link = extractTag(rss, 'link');
      expect(link).toBe('https://azure.microsoft.com/en-us/updates/azure-openai-service-update/');
    });
  });

  describe('Other Tag Extraction', () => {
    it('should extract title correctly', () => {
      const rss = `
        <item>
          <title>My Blog Post Title</title>
          <link>https://example.com/post</link>
        </item>
      `;
      const title = extractTag(rss, 'title');
      expect(title).toBe('My Blog Post Title');
    });

    it('should extract guid correctly', () => {
      const rss = `
        <item>
          <guid>https://example.com/unique-id-123</guid>
        </item>
      `;
      const guid = extractTag(rss, 'guid');
      expect(guid).toBe('https://example.com/unique-id-123');
    });
  });
});
