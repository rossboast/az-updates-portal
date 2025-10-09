import fetch from 'node-fetch';
import { createOrUpdateItem } from '../lib/cosmosClient.js';

const BLOG_FEEDS = [
  {
    url: 'https://azure.microsoft.com/en-us/blog/feed/',
    name: 'Azure Blog',
    categories: ['Azure', 'Microsoft']
  },
  {
    url: 'https://devblogs.microsoft.com/azure-sdk/feed/',
    name: 'Azure SDK Blog',
    categories: ['Azure', 'SDK', 'Development']
  },
  {
    url: 'https://techcommunity.microsoft.com/plugins/custom/microsoft/o365/custom-blog-rss?board=AzureBlog',
    name: 'Azure Tech Community',
    categories: ['Azure', 'Community']
  }
];

export async function fetchBlogPosts(myTimer, context, options = {}) {
  const { daysBack = null } = options;
  
  context.log('Fetching blog posts from multiple sources...');
  
  if (daysBack) {
    context.log(`Filtering blog posts from last ${daysBack} days only`);
  }

  let totalSaved = 0;

  for (const feed of BLOG_FEEDS) {
    try {
      context.log(`Fetching from ${feed.name}...`);
      const response = await fetch(feed.url);
      const xmlText = await response.text();

      let posts = parseRSSFeed(xmlText, feed);
      context.log(`Found ${posts.length} posts from ${feed.name}`);

      if (daysBack) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);
        
        posts = posts.filter(post => 
          new Date(post.publishedDate) >= cutoffDate
        );
        context.log(`Filtered to ${posts.length} posts from last ${daysBack} days`);
      }

      for (const post of posts) {
        try {
          await createOrUpdateItem(post);
          totalSaved++;
        } catch (error) {
          context.error(`Error saving post ${post.id}:`, error);
        }
      }
    } catch (error) {
      context.error(`Error fetching from ${feed.name}:`, error);
    }
  }

  context.log(`Successfully saved ${totalSaved} blog posts`);
}

function parseRSSFeed(xmlText, feed) {
  const posts = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const items = [...xmlText.matchAll(itemRegex)];

  for (const item of items) {
    const itemContent = item[1];
    
    const title = extractTag(itemContent, 'title');
    const link = extractTag(itemContent, 'link');
    const description = extractTag(itemContent, 'description');
    const pubDate = extractTag(itemContent, 'pubDate');
    const guid = extractTag(itemContent, 'guid');
    const creator = extractTag(itemContent, 'dc:creator') || extractTag(itemContent, 'author');

    const categories = extractCategories(itemContent).concat(feed.categories);

    if (title && link) {
      posts.push({
        id: guid || link,
        title: cleanText(title),
        description: cleanText(description).substring(0, 500),
        link,
        publishedDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: feed.name,
        type: 'blog',
        author: cleanText(creator),
        categories: [...new Set(categories)]
      });
    }
  }

  return posts;
}

function extractTag(text, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function extractCategories(text) {
  const categoryRegex = /<category>([^<]+)<\/category>/g;
  const categories = [];
  let match;
  
  while ((match = categoryRegex.exec(text)) !== null) {
    categories.push(match[1].trim());
  }
  
  return categories;
}

function cleanText(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
