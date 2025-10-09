import { CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';

let client;
let database;
let container;
let useMockData = false;

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
  }
];

function initializeCosmosClient() {
  if (!client) {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const databaseName = process.env.COSMOS_DATABASE_NAME || 'AzureUpdatesDB';
    const containerName = process.env.COSMOS_CONTAINER_NAME || 'Updates';

    // Check if we should use mock data (local development without CosmosDB)
    if (!endpoint || endpoint.includes('localhost') || process.env.USE_MOCK_DATA === 'true') {
      console.log('Using mock data for local development');
      useMockData = true;
      return { client: null, database: null, container: null };
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
  
  if (useMockData || !container) {
    // Return mock data filtered by query if applicable
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

  try {
    const { resources } = await container.items.query(querySpec, { maxItemCount: maxItems }).fetchAll();
    return resources;
  } catch (error) {
    console.error('CosmosDB query failed, falling back to mock data:', error.message);
    useMockData = true;
    return mockUpdates.slice(0, maxItems);
  }
}

export async function createOrUpdateItem(item) {
  const { container } = initializeCosmosClient();
  
  if (useMockData || !container) {
    console.log('Mock mode: Item would be saved to CosmosDB:', item.id);
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
  
  if (useMockData || !container) {
    const item = mockUpdates.find(u => u.id === id);
    return item || null;
  }

  try {
    const { resource } = await container.item(id, partitionKey).read();
    return resource;
  } catch (error) {
    console.error('Failed to get item from CosmosDB:', error.message);
    return null;
  }
}

export async function isFirstRun() {
  const { container } = initializeCosmosClient();
  
  if (useMockData || !container) {
    return false;
  }
  
  try {
    const { resources } = await container.items.query({
      query: 'SELECT VALUE COUNT(1) FROM c'
    }).fetchAll();
    
    return resources[0] === 0;
  } catch (error) {
    console.error('Failed to check if first run:', error.message);
    return false;
  }
}
