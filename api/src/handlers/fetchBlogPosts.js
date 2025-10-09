import Parser from 'rss-parser';
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

const parser = new Parser({
  customFields: {
    item: ['dc:creator', 'author']
  }
});

export async function fetchBlogPosts(myTimer, context) {
  context.log('Fetching blog posts from multiple sources...');

  let totalSaved = 0;

  for (const feed of BLOG_FEEDS) {
    try {
      context.log(`Fetching from ${feed.name}...`);
      
      const feedData = await parser.parseURL(feed.url);
      context.log(`Found ${feedData.items.length} posts from ${feed.name}`);

      for (const item of feedData.items) {
        const post = {
          id: item.guid || item.link,
          title: item.title || '',
          description: (item.contentSnippet || item.content || '').substring(0, 500),
          link: item.link || '',
          publishedDate: item.pubDate || item.isoDate ? new Date(item.pubDate || item.isoDate).toISOString() : new Date().toISOString(),
          source: feed.name,
          type: 'blog',
          author: item['dc:creator'] || item.creator || item.author || '',
          categories: [
            ...(item.categories || []),
            ...feed.categories
          ].filter((v, i, a) => a.indexOf(v) === i)
        };

        if (post.title && post.link) {
          try {
            await createOrUpdateItem(post);
            totalSaved++;
          } catch (error) {
            context.error(`Error saving post ${post.id}:`, error);
          }
        }
      }
    } catch (error) {
      context.error(`Error fetching from ${feed.name}:`, error);
    }
  }

  context.log(`Successfully saved ${totalSaved} blog posts`);
}
