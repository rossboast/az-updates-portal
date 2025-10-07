import { app } from '@azure/functions';
import { getUpdates, getCategories, getUpdatesByCategory } from './handlers/updates.js';
import { fetchAzureUpdates } from './handlers/fetchAzureUpdates.js';
import { fetchBlogPosts } from './handlers/fetchBlogPosts.js';

// HTTP endpoints
app.http('getUpdates', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'updates',
  handler: getUpdates
});

app.http('getCategories', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'categories',
  handler: getCategories
});

app.http('getUpdatesByCategory', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'updates/category/{category}',
  handler: getUpdatesByCategory
});

// Timer-triggered functions to fetch updates
app.timer('fetchAzureUpdates', {
  schedule: '0 0 */6 * * *', // Every 6 hours
  handler: fetchAzureUpdates
});

app.timer('fetchBlogPosts', {
  schedule: '0 0 */12 * * *', // Every 12 hours
  handler: fetchBlogPosts
});
