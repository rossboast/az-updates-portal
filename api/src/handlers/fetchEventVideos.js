import fetch from 'node-fetch';
import { createOrUpdateItem } from '../lib/cosmosClient.js';

const EVENT_VIDEO_FEEDS = [
  {
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCrhJmfAGQ5K81XQ8_od1iTg',
    name: 'Microsoft Ignite',
    categories: ['Microsoft Ignite', 'Events', 'Videos', 'Microsoft', 'Azure']
  },
  {
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCrhJmfAGQ5K81XQ8_od1iTg',
    name: 'Microsoft Build',
    categories: ['Microsoft Build', 'Events', 'Videos', 'Microsoft', 'Azure']
  }
];

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export async function fetchEventVideos(myTimer, context) {
  context.log('Fetching event videos from YouTube...');

  let totalSaved = 0;
  const oneYearAgo = new Date(Date.now() - ONE_YEAR_MS);

  for (const feed of EVENT_VIDEO_FEEDS) {
    try {
      context.log(`Fetching from ${feed.name}...`);
      const response = await fetch(feed.url);
      const xmlText = await response.text();

      const videos = parseYouTubeFeed(xmlText, feed, oneYearAgo);
      context.log(`Found ${videos.length} videos from ${feed.name} in the last year`);

      for (const video of videos) {
        try {
          await createOrUpdateItem(video);
          totalSaved++;
        } catch (error) {
          context.error(`Error saving video ${video.id}:`, error);
        }
      }
    } catch (error) {
      context.error(`Error fetching from ${feed.name}:`, error);
    }
  }

  context.log(`Successfully saved ${totalSaved} event videos`);
}

function parseYouTubeFeed(xmlText, feed, oneYearAgo) {
  const videos = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  const entries = [...xmlText.matchAll(entryRegex)];

  for (const entry of entries) {
    const entryContent = entry[1];
    
    const title = extractTag(entryContent, 'title');
    const videoId = extractTag(entryContent, 'yt:videoId');
    const published = extractTag(entryContent, 'published');
    const channelId = extractTag(entryContent, 'yt:channelId');
    const author = extractTag(entryContent, 'name');
    
    const mediaGroup = entryContent.match(/<media:group>([\s\S]*?)<\/media:group>/);
    let description = '';
    
    if (mediaGroup) {
      description = extractTag(mediaGroup[1], 'media:description');
    }

    const link = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
    const publishedDate = published ? new Date(published) : new Date();

    if (publishedDate < oneYearAgo) {
      continue;
    }

    if (title && videoId) {
      videos.push({
        id: `youtube-${videoId}`,
        title: cleanText(title),
        description: cleanText(description).substring(0, 500),
        link,
        publishedDate: publishedDate.toISOString(),
        source: feed.name,
        type: 'video',
        author: cleanText(author),
        categories: [...new Set(feed.categories)]
      });
    }
  }

  return videos;
}

function extractTag(text, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
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
