import { queryUpdates } from '../lib/cosmosClient.js';

export async function getUpdates(request, context) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    let querySpec = {
      query: 'SELECT * FROM c ORDER BY c.publishedDate DESC',
      parameters: []
    };

    if (category) {
      querySpec = {
        query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.categories, @category) ORDER BY c.publishedDate DESC',
        parameters: [{ name: '@category', value: category }]
      };
    }

    const updates = await queryUpdates(querySpec, limit);

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(updates)
    };
  } catch (error) {
    context.error('Error fetching updates:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch updates' })
    };
  }
}

export async function getCategories(request, context) {
  try {
    const querySpec = {
      query: 'SELECT DISTINCT VALUE c FROM u JOIN c IN u.categories'
    };

    const categories = await queryUpdates(querySpec, 100);

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(categories)
    };
  } catch (error) {
    context.error('Error fetching categories:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch categories' })
    };
  }
}

export async function getUpdatesByCategory(request, context) {
  try {
    const category = request.params.category;
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '50', 10);

    const querySpec = {
      query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.categories, @category) ORDER BY c.publishedDate DESC',
      parameters: [{ name: '@category', value: category }]
    };

    const updates = await queryUpdates(querySpec, limit);

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(updates)
    };
  } catch (error) {
    context.error('Error fetching updates by category:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch updates' })
    };
  }
}
