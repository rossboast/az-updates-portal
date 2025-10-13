import { CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let client;
let database;
let container;
let dataMode = null; // 'mock', 'snapshot', or 'live'
let snapshotUpdates = [];

// Mock data for local development
const mockUpdates = [
  {
    id: 'mock-1',
    title: 'Azure OpenAI Service Now Generally Available',
    description: 'Azure OpenAI Service brings advanced AI capabilities to your applications with GPT-4, GPT-3.5-Turbo, and embeddings models.',
    link: 'https://azure.microsoft.com/updates/azure-openai-ga',
    publishedDate: new Date(Date.now() - 86400000).toISOString(),
    source: 'Azure Updates',
    type: 'update',
    categories: ['AI', 'Azure', 'Cognitive Services']
  },
  {
    id: 'mock-2',
    title: 'New Azure Functions Flex Consumption Plan',
    description: 'The Flex Consumption plan offers improved cold start performance and more flexible scaling options for your serverless functions.',
    link: 'https://azure.microsoft.com/updates/functions-flex',
    publishedDate: new Date(Date.now() - 172800000).toISOString(),
    source: 'Azure Updates',
    type: 'update',
    categories: ['Compute', 'Azure Functions', 'Serverless']
  },
  {
    id: 'mock-3',
    title: 'Building Modern Web Apps with Azure and Vue.js',
    description: 'Learn how to create scalable, responsive web applications using Vue.js 3 and Azure services including App Service, Functions, and CosmosDB.',
    link: 'https://azure.microsoft.com/blog/vue-modern-apps',
    publishedDate: new Date(Date.now() - 259200000).toISOString(),
    source: 'Azure Blog',
    type: 'blog',
    author: 'Azure Team',
    categories: ['Development', 'Azure', 'Web Development']
  },
  {
    id: 'mock-4',
    title: 'Azure Container Apps Update: New Features',
    description: 'Azure Container Apps now supports additional networking capabilities, improved observability, and enhanced scaling options.',
    link: 'https://azure.microsoft.com/updates/container-apps-update',
    publishedDate: new Date(Date.now() - 345600000).toISOString(),
    source: 'Azure Updates',
    type: 'update',
    categories: ['Compute', 'Containers', 'Azure']
  },
  {
    id: 'mock-5',
    title: 'Getting Started with Azure SDK for JavaScript',
    description: 'A comprehensive guide to using the Azure SDK for JavaScript in your Node.js applications.',
    link: 'https://devblogs.microsoft.com/azure-sdk/js-getting-started',
    publishedDate: new Date(Date.now() - 432000000).toISOString(),
    source: 'Azure SDK Blog',
    type: 'blog',
    author: 'SDK Team',
    categories: ['Development', 'SDK', 'JavaScript', 'Azure']
  },
  {
    id: 'mock-6',
    title: 'Azure Integration Services: New Connectors Available',
    description: 'New connectors for Azure Logic Apps and Azure Functions enable easier integration with popular SaaS applications.',
    link: 'https://azure.microsoft.com/updates/integration-connectors',
    publishedDate: new Date(Date.now() - 518400000).toISOString(),
    source: 'Azure Updates',
    type: 'update',
    categories: ['Integration', 'Logic Apps', 'Azure']
  },
  {
    id: 'mock-video-1',
    title: 'Building Cloud-Native Applications with Azure',
    description: 'Learn how to design and build modern cloud-native applications using Azure services. This session covers architecture patterns, best practices, and real-world examples from Microsoft Build.',
    link: 'https://www.youtube.com/watch?v=example1',
    publishedDate: new Date(Date.now() - 604800000).toISOString(),
    source: 'Microsoft Build',
    type: 'video',
    author: 'Microsoft',
    categories: ['Build', 'Azure', 'Developer', 'Innovation']
  },
  {
    id: 'mock-video-2',
    title: 'Azure AI Services: What\'s New',
    description: 'Discover the latest innovations in Azure AI Services including new models, enhanced capabilities, and integration scenarios. Presented at Microsoft Ignite.',
    link: 'https://www.youtube.com/watch?v=example2',
    publishedDate: new Date(Date.now() - 691200000).toISOString(),
    source: 'Microsoft Ignite',
    type: 'video',
    author: 'Microsoft',
    categories: ['Ignite', 'Azure', 'Cloud', 'AI']
  }
];

async function loadSnapshotData() {
  if (snapshotUpdates.length > 0) {
    return; // Already loaded
  }

  try {
    const snapshotPath = path.join(__dirname, '../../tests/fixtures/feed-snapshot.json');
    const data = await fs.readFile(snapshotPath, 'utf-8');
    const snapshot = JSON.parse(data);

    // Transform snapshot data into update format
    const updates = [];
    
    // Add updates
    snapshot.feeds.updates?.forEach(feed => {
      feed.items?.forEach((item, index) => {
        updates.push({
          id: `snapshot-update-${feed.feedName}-${index}`,
          title: item.title,
          description: item.description?.substring(0, 500) || '',
          link: item.link,
          publishedDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          source: feed.feedName,
          type: 'update',
          categories: item.categories || []
        });
      });
    });

    // Add blogs
    snapshot.feeds.blogs?.forEach(feed => {
      feed.items?.forEach((item, index) => {
        updates.push({
          id: `snapshot-blog-${feed.feedName}-${index}`,
          title: item.title,
          description: item.description?.substring(0, 500) || '',
          link: item.link,
          publishedDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          source: feed.feedName,
          type: 'blog',
          author: item.author || '',
          categories: item.categories || []
        });
      });
    });

    // Add videos
    snapshot.feeds.videos?.forEach(feed => {
      feed.items?.forEach((item, index) => {
        const videoId = item.videoId || '';
        updates.push({
          id: videoId ? `youtube-${videoId}` : `snapshot-video-${feed.feedName}-${index}`,
          title: item.title,
          description: item.description?.substring(0, 500) || '',
          link: videoId ? `https://www.youtube.com/watch?v=${videoId}` : item.link,
          publishedDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          source: feed.feedName,
          type: 'video',
          author: item.author || 'Microsoft',
          categories: item.categories || []
        });
      });
    });

    snapshotUpdates = updates;
    console.log(`Loaded ${snapshotUpdates.length} items from snapshot data`);
  } catch (error) {
    console.warn('Could not load snapshot data:', error.message);
    snapshotUpdates = [];
  }
}

function initializeCosmosClient() {
  if (!client && !dataMode) {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const databaseName = process.env.COSMOS_DATABASE_NAME || 'AzureUpdatesDB';
    const containerName = process.env.COSMOS_CONTAINER_NAME || 'Updates';
    const mode = (process.env.DATA_MODE || 'mock').toLowerCase();

    // Validate DATA_MODE
    if (!['mock', 'snapshot', 'live'].includes(mode)) {
      console.warn(`Invalid DATA_MODE: "${mode}". Using mock data. Valid values: mock, snapshot, live`);
      dataMode = 'mock';
      return { client: null, database: null, container: null };
    }

    // Validate LIVE mode requires COSMOS_ENDPOINT
    if (mode === 'live') {
      if (!endpoint || endpoint.includes('localhost')) {
        throw new Error('DATA_MODE=live requires a valid COSMOS_ENDPOINT. Please set COSMOS_ENDPOINT in local.settings.json');
      }
    }

    dataMode = mode;

    // Handle MOCK mode
    if (mode === 'mock') {
      console.log('🎭 Using mock data for local development');
      return { client: null, database: null, container: null };
    }

    // Handle SNAPSHOT mode
    if (mode === 'snapshot') {
      console.log('📸 Using snapshot data for local development');
      return { client: null, database: null, container: null };
    }

    // Handle LIVE mode - connect to CosmosDB
    if (mode === 'live') {
      console.log('🌐 Connecting to live CosmosDB...');
    }

    try {
      const credential = new DefaultAzureCredential();
      client = new CosmosClient({ endpoint, aadCredentials: credential });
      database = client.database(databaseName);
      container = database.container(containerName);
    } catch (error) {
      console.error('Failed to initialize CosmosDB client, falling back to mock data:', error.message);
      useMockData = true;
    }
  }

  return { client, database, container };
}

export async function queryUpdates(querySpec, maxItems = 100) {
  const { container } = initializeCosmosClient();
  
  // Handle SNAPSHOT mode
  if (dataMode === 'snapshot') {
    await loadSnapshotData();
    console.log('Returning snapshot data');
    let results = [...snapshotUpdates];
    
    // Simple filtering for category queries
    if (querySpec.query && querySpec.query.includes('ARRAY_CONTAINS')) {
      const categoryParam = querySpec.parameters?.find(p => p.name === '@category');
      if (categoryParam) {
        results = results.filter(item => 
          item.categories && item.categories.includes(categoryParam.value)
        );
      }
    }
    
    // Simple filtering for distinct categories query
    if (querySpec.query && querySpec.query.includes('DISTINCT VALUE c')) {
      const allCategories = new Set();
      snapshotUpdates.forEach(item => {
        item.categories?.forEach(cat => allCategories.add(cat));
      });
      return Array.from(allCategories);
    }
    
    // Limit results
    return results.slice(0, maxItems);
  }
  
  // Handle MOCK mode
  if (dataMode === 'mock') {
    console.log('Returning mock data');
    let results = [...mockUpdates];
    
    // Simple filtering for category queries
    if (querySpec.query && querySpec.query.includes('ARRAY_CONTAINS')) {
      const categoryParam = querySpec.parameters?.find(p => p.name === '@category');
      if (categoryParam) {
        results = results.filter(item => 
          item.categories && item.categories.includes(categoryParam.value)
        );
      }
    }
    
    // Simple filtering for distinct categories query
    if (querySpec.query && querySpec.query.includes('DISTINCT VALUE c')) {
      const allCategories = new Set();
      mockUpdates.forEach(item => {
        item.categories?.forEach(cat => allCategories.add(cat));
      });
      return Array.from(allCategories);
    }
    
    // Limit results
    return results.slice(0, maxItems);
  }
  
  // Handle LIVE mode - query CosmosDB
  if (!container) {
    console.error('CosmosDB container not initialized, falling back to mock data');
    dataMode = 'mock';
    return queryUpdates(querySpec, maxItems);
  }

  try {
    const { resources } = await container.items.query(querySpec, { maxItemCount: maxItems }).fetchAll();
    return resources;
  } catch (error) {
    console.error('CosmosDB query failed, falling back to mock data:', error.message);
    dataMode = 'mock';
    return queryUpdates(querySpec, maxItems);
  }
}

export async function createOrUpdateItem(item) {
  const { container } = initializeCosmosClient();
  
  if (dataMode === 'mock') {
    console.log('Mock mode: Item would be saved to CosmosDB:', item.id);
    return item;
  }
  
  if (dataMode === 'snapshot') {
    console.log('Snapshot mode: Item would be saved to CosmosDB:', item.id);
    return item;
  }
  
  if (!container) {
    console.warn('CosmosDB not available, item not saved:', item.id);
    return item;
  }

  try {
    const { resource } = await container.items.upsert(item);
    return resource;
  } catch (error) {
    console.error('Failed to save item to CosmosDB:', error.message);
    throw error;
  }
}

export async function getItemById(id, partitionKey) {
  const { container } = initializeCosmosClient();
  
  if (dataMode === 'snapshot') {
    await loadSnapshotData();
    const item = snapshotUpdates.find(u => u.id === id);
    return item || null;
  }
  
  if (dataMode === 'mock') {
    const item = mockUpdates.find(u => u.id === id);
    return item || null;
  }
  
  if (!container) {
    console.warn('CosmosDB not available');
    return null;
  }

  try {
    const { resource } = await container.item(id, partitionKey).read();
    return resource;
  } catch (error) {
    console.error('Failed to get item from CosmosDB:', error.message);
    return null;
  }
}
