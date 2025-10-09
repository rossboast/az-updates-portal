import { describe, it, expect, beforeEach } from 'vitest';
import { queryUpdates, createOrUpdateItem, getItemById, isFirstRun } from '../src/lib/cosmosClient.js';

describe('CosmosDB Client - Mock Data Mode', () => {
  beforeEach(() => {
    // Ensure we're using mock data
    process.env.USE_MOCK_DATA = 'true';
    delete process.env.COSMOS_ENDPOINT;
  });

  describe('queryUpdates', () => {
    it('should return all mock updates', async () => {
      const querySpec = { query: 'SELECT * FROM c' };
      const results = await queryUpdates(querySpec);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(6);
    });

    it('should return updates with specific category', async () => {
      const querySpec = {
        query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.categories, @category)',
        parameters: [{ name: '@category', value: 'AI' }]
      };
      const results = await queryUpdates(querySpec);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].categories).toContain('AI');
    });

    it('should return distinct categories', async () => {
      const querySpec = {
        query: 'SELECT DISTINCT VALUE c FROM u JOIN c IN u.categories'
      };
      const results = await queryUpdates(querySpec);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results).toContain('AI');
      expect(results).toContain('Azure');
      expect(results).toContain('Compute');
    });

    it('should limit results', async () => {
      const querySpec = { query: 'SELECT * FROM c' };
      const results = await queryUpdates(querySpec, 3);
      
      expect(results).toBeDefined();
      expect(results.length).toBe(3);
    });

    it('should handle empty query results', async () => {
      const querySpec = {
        query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.categories, @category)',
        parameters: [{ name: '@category', value: 'NonExistent' }]
      };
      const results = await queryUpdates(querySpec);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('createOrUpdateItem', () => {
    it('should log item creation in mock mode', async () => {
      const testItem = {
        id: 'test-1',
        title: 'Test Update',
        type: 'update',
        categories: ['Test']
      };
      
      const result = await createOrUpdateItem(testItem);
      expect(result).toBeDefined();
      expect(result.id).toBe('test-1');
    });
  });

  describe('getItemById', () => {
    it('should return existing mock item', async () => {
      const result = await getItemById('mock-1', 'update');
      
      expect(result).toBeDefined();
      expect(result.id).toBe('mock-1');
      expect(result.title).toBeDefined();
    });

    it('should return null for non-existent item', async () => {
      const result = await getItemById('non-existent', 'update');
      
      expect(result).toBeNull();
    });
  });

  describe('Mock Data Structure', () => {
    it('should have all required fields', async () => {
      const querySpec = { query: 'SELECT * FROM c' };
      const results = await queryUpdates(querySpec);
      
      results.forEach(update => {
        expect(update).toHaveProperty('id');
        expect(update).toHaveProperty('title');
        expect(update).toHaveProperty('description');
        expect(update).toHaveProperty('link');
        expect(update).toHaveProperty('publishedDate');
        expect(update).toHaveProperty('source');
        expect(update).toHaveProperty('type');
        expect(update).toHaveProperty('categories');
        expect(Array.isArray(update.categories)).toBe(true);
      });
    });

    it('should have both update and blog types', async () => {
      const querySpec = { query: 'SELECT * FROM c' };
      const results = await queryUpdates(querySpec);
      
      const types = [...new Set(results.map(u => u.type))];
      expect(types).toContain('update');
      expect(types).toContain('blog');
    });

    it('should have multiple categories', async () => {
      const querySpec = {
        query: 'SELECT DISTINCT VALUE c FROM u JOIN c IN u.categories'
      };
      const categories = await queryUpdates(querySpec);
      
      expect(categories.length).toBeGreaterThan(5);
      expect(categories).toContain('AI');
      expect(categories).toContain('Compute');
      expect(categories).toContain('Integration');
    });
  });

  describe('isFirstRun', () => {
    it('should return false in mock mode', async () => {
      const result = await isFirstRun();
      
      expect(result).toBe(false);
    });
  });
});
