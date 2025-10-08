import { app } from '@azure/functions';
import { getUpdates, getCategories, getUpdatesByCategory } from './handlers/updates.js';
import { fetchUpdates } from './handlers/fetchUpdates.js';
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
app.timer('fetchUpdates', {
  schedule: '0 0 */6 * * *', // Every 6 hours
  handler: fetchUpdates
});

app.timer('fetchBlogPosts', {
  schedule: '0 0 */12 * * *', // Every 12 hours
  handler: fetchBlogPosts
});
