import fetch from 'node-fetch';
import { createOrUpdateItem } from '../lib/cosmosClient.js';

const AZURE_UPDATES_RSS = 'https://azurecomcdn.azureedge.net/en-us/updates/feed/';

export async function fetchUpdates(myTimer, context) {
  context.log('Fetching Azure updates...');

  try {
    const response = await fetch(AZURE_UPDATES_RSS);
    const xmlText = await response.text();

    const updates = parseAzureUpdatesRSS(xmlText);
    context.log(`Found ${updates.length} Azure updates`);

    let savedCount = 0;
    for (const update of updates) {
      try {
        await createOrUpdateItem(update);
        savedCount++;
      } catch (error) {
        context.error(`Error saving update ${update.id}:`, error);
      }
    }

    context.log(`Successfully saved ${savedCount} Azure updates`);
  } catch (error) {
    context.error('Error fetching Azure updates:', error);
    throw error;
  }
}

function parseAzureUpdatesRSS(xmlText) {
  const updates = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const items = [...xmlText.matchAll(itemRegex)];

  for (const item of items) {
    const itemContent = item[1];
    
    const title = extractTag(itemContent, 'title');
    const link = extractTag(itemContent, 'link');
    const description = extractTag(itemContent, 'description');
    const pubDate = extractTag(itemContent, 'pubDate');
    const guid = extractTag(itemContent, 'guid');

    const categories = extractCategories(itemContent);

    if (title && link) {
      updates.push({
        id: guid || link,
        title: cleanText(title),
        description: cleanText(description),
        link,
        publishedDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: 'Azure Updates',
        type: 'update',
        categories: categories.length > 0 ? categories : ['General']
      });
    }
  }

  return updates;
}

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
    .trim();
}
