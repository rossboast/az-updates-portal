import Parser from 'rss-parser';
import { createOrUpdateItem } from '../lib/cosmosClient.js';

const EVENT_VIDEO_FEEDS = [
  {
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCrhJmfAGQ5K81XQ8_od1iTg',
    name: 'Microsoft Ignite',
    categories: ['Ignite', 'Azure', 'Cloud', 'AI']
  },
  {
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCrhJmfAGQ5K81XQ8_od1iTg',
    name: 'Microsoft Build',
    categories: ['Build', 'Azure', 'Developer', 'Innovation']
  }
];

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const parser = new Parser({
  customFields: {
    item: [
      ['yt:videoId', 'videoId'],
      ['yt:channelId', 'channelId'],
      ['media:group', 'mediaGroup']
    ]
  }
});

export async function fetchEventVideos(myTimer, context) {
  context.log('Fetching event videos from YouTube...');

  let totalSaved = 0;
  const oneYearAgo = new Date(Date.now() - ONE_YEAR_MS);

  for (const feed of EVENT_VIDEO_FEEDS) {
    try {
      context.log(`Fetching from ${feed.name}...`);
      
      const feedData = await parser.parseURL(feed.url);
      const recentVideos = feedData.items.filter(item => {
        const pubDate = new Date(item.pubDate || item.isoDate);
        return pubDate >= oneYearAgo;
      });
      
      context.log(`Found ${recentVideos.length} videos from ${feed.name} in the last year`);

      for (const item of recentVideos) {
        const videoId = item.videoId || '';
        const video = {
          id: videoId ? `youtube-${videoId}` : item.guid || item.link,
          title: item.title || '',
          description: (item.contentSnippet || item.content || '').substring(0, 500),
          link: videoId ? `https://www.youtube.com/watch?v=${videoId}` : item.link || '',
          publishedDate: item.pubDate || item.isoDate ? new Date(item.pubDate || item.isoDate).toISOString() : new Date().toISOString(),
          source: feed.name,
          type: 'video',
          author: item.author || 'Microsoft',
          categories: [...new Set(feed.categories)]
        };

        if (video.title && video.link) {
          try {
            await createOrUpdateItem(video);
            totalSaved++;
          } catch (error) {
            context.error(`Error saving video ${video.id}:`, error);
          }
        }
      }
    } catch (error) {
      context.error(`Error fetching from ${feed.name}:`, error);
    }
  }

  context.log(`Successfully saved ${totalSaved} event videos`);
}
