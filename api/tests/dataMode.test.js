import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DATA_MODE Configuration', () => {
  let cosmosClient;

  beforeEach(async () => {
    // Reset the module to clear cached state
    vi.resetModules();
    
    // Clean up environment
    delete process.env.DATA_MODE;
    delete process.env.COSMOS_ENDPOINT;
    
    // Dynamically import fresh module
    cosmosClient = await import('../src/lib/cosmosClient.js');
  });

  it('should default to mock mode when DATA_MODE is not set', async () => {
    const results = await cosmosClient.queryUpdates({ query: 'SELECT * FROM c' });
    expect(results).toBeDefined();
    expect(results.length).toBe(8); // Mock data has 8 items
  });

  it('should use mock mode when DATA_MODE is "mock"', async () => {
    process.env.DATA_MODE = 'mock';
    vi.resetModules();
    const freshCosmosClient = await import('../src/lib/cosmosClient.js');
    
    const results = await freshCosmosClient.queryUpdates({ query: 'SELECT * FROM c' });
    expect(results).toBeDefined();
    expect(results.length).toBe(8);
  });

  it('should use snapshot mode when DATA_MODE is "snapshot"', async () => {
    process.env.DATA_MODE = 'snapshot';
    vi.resetModules();
    const freshCosmosClient = await import('../src/lib/cosmosClient.js');
    
    const results = await freshCosmosClient.queryUpdates({ query: 'SELECT * FROM c' });
    expect(results).toBeDefined();
    // Snapshot has ~15 items (varies based on real data)
    expect(results.length).toBeGreaterThan(8);
  });

  it('should throw error when DATA_MODE is "live" without COSMOS_ENDPOINT', async () => {
    process.env.DATA_MODE = 'live';
    vi.resetModules();
    const freshCosmosClient = await import('../src/lib/cosmosClient.js');
    
    await expect(
      freshCosmosClient.queryUpdates({ query: 'SELECT * FROM c' })
    ).rejects.toThrow('DATA_MODE=live requires a valid COSMOS_ENDPOINT');
  });

  it('should throw error when DATA_MODE is "live" with localhost COSMOS_ENDPOINT', async () => {
    process.env.DATA_MODE = 'live';
    process.env.COSMOS_ENDPOINT = 'https://localhost:8081';
    vi.resetModules();
    const freshCosmosClient = await import('../src/lib/cosmosClient.js');
    
    await expect(
      freshCosmosClient.queryUpdates({ query: 'SELECT * FROM c' })
    ).rejects.toThrow('DATA_MODE=live requires a valid COSMOS_ENDPOINT');
  });

  it('should fall back to mock mode for invalid DATA_MODE', async () => {
    process.env.DATA_MODE = 'invalid';
    vi.resetModules();
    const freshCosmosClient = await import('../src/lib/cosmosClient.js');
    
    const results = await freshCosmosClient.queryUpdates({ query: 'SELECT * FROM c' });
    expect(results).toBeDefined();
    expect(results.length).toBe(8); // Falls back to mock
  });

  it('should handle case-insensitive DATA_MODE values', async () => {
    process.env.DATA_MODE = 'MOCK';
    vi.resetModules();
    const freshCosmosClient = await import('../src/lib/cosmosClient.js');
    
    const results = await freshCosmosClient.queryUpdates({ query: 'SELECT * FROM c' });
    expect(results).toBeDefined();
    expect(results.length).toBe(8);
  });
});
