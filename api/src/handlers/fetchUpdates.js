import Parser from 'rss-parser';
import { createOrUpdateItem } from '../lib/cosmosClient.js';

const AZURE_UPDATES_RSS = 'https://azurecomcdn.azureedge.net/en-us/updates/feed/';

const parser = new Parser();

export async function fetchUpdates(myTimer, context, options = {}) {
  const { daysBack = null } = options;
  
  context.log('Fetching Azure updates...');
  
  if (daysBack) {
    context.log(`Filtering updates from last ${daysBack} days only`);
  }

  try {
    const feedData = await parser.parseURL(AZURE_UPDATES_RSS);
    context.log(`Found ${feedData.items.length} Azure updates from RSS feed`);

    let items = feedData.items;
    
    if (daysBack) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);
      
      items = items.filter(item => {
        const itemDate = item.pubDate || item.isoDate ? new Date(item.pubDate || item.isoDate) : new Date();
        return itemDate >= cutoffDate;
      });
      context.log(`Filtered to ${items.length} updates from last ${daysBack} days`);
    }

    let savedCount = 0;
    for (const item of items) {
      const update = {
        id: item.guid || item.link,
        title: item.title || '',
        description: item.contentSnippet || item.content || '',
        link: item.link || '',
        publishedDate: item.pubDate || item.isoDate ? new Date(item.pubDate || item.isoDate).toISOString() : new Date().toISOString(),
        source: 'Azure Updates',
        type: 'update',
        categories: item.categories && item.categories.length > 0 ? item.categories : ['General']
      };

      if (update.title && update.link) {
        try {
          await createOrUpdateItem(update);
          savedCount++;
        } catch (error) {
          context.error(`Error saving update ${update.id}:`, error);
        }
      }
    }

    context.log(`Successfully saved ${savedCount} Azure updates`);
  } catch (error) {
    context.error('Error fetching Azure updates:', error);
    throw error;
  }
}
