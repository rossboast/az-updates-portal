import { isFirstRun } from '../lib/cosmosClient.js';
import { fetchUpdates } from './fetchUpdates.js';
import { fetchBlogPosts } from './fetchBlogPosts.js';
import { fetchEventVideos } from './fetchEventVideos.js';

export async function warmupCache(context) {
  context.log('Warming up cache on function startup...');
  
  try {
    const firstRun = await isFirstRun();
    
    if (firstRun) {
      context.log('First run detected - fetching last 6 months (180 days) of updates, blogs, and videos');
      await Promise.all([
        fetchUpdates(null, context, { daysBack: 180 }),
        fetchBlogPosts(null, context, { daysBack: 180 }),
        fetchEventVideos(null, context, { daysBack: 180 })
      ]);
      context.log('Initial cache warmup complete');
    } else {
      context.log('Cache already populated, skipping initial warmup');
      await Promise.all([
        fetchUpdates(null, context),
        fetchBlogPosts(null, context),
        fetchEventVideos(null, context)
      ]);
      context.log('Regular cache refresh complete');
    }
  } catch (error) {
    context.error('Cache warmup failed:', error);
  }
}
