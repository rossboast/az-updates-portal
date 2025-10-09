import { describe, it, expect, beforeEach } from 'vitest';
import { getUpdates, getCategories, getUpdatesByCategory } from '../src/handlers/updates.js';

describe('Updates Handlers', () => {
  beforeEach(() => {
    // Ensure we're using mock data
    process.env.USE_MOCK_DATA = 'true';
    delete process.env.COSMOS_ENDPOINT;
  });

  const createMockContext = () => ({
    log: () => {},
    error: () => {}
  });

  const createMockRequest = (url) => ({
    url,
    params: {}
  });

  describe('getUpdates', () => {
    it('should return all updates', async () => {
      const request = createMockRequest('http://localhost:7071/api/updates');
      const context = createMockContext();
      
      const response = await getUpdates(request, context);
      
      expect(response.status).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/json');
      
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(8);
    });

    it('should filter by category', async () => {
      const request = createMockRequest('http://localhost:7071/api/updates?category=AI');
      const context = createMockContext();
      
      const response = await getUpdates(request, context);
      
      expect(response.status).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      body.forEach(update => {
        expect(update.categories).toContain('AI');
      });
    });

    it('should respect limit parameter', async () => {
      const request = createMockRequest('http://localhost:7071/api/updates?limit=3');
      const context = createMockContext();
      
      const response = await getUpdates(request, context);
      
      expect(response.status).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.length).toBeLessThanOrEqual(3);
    });

    it('should handle errors gracefully', async () => {
      const request = createMockRequest('invalid-url');
      const context = createMockContext();
      
      const response = await getUpdates(request, context);
      
      // Should still return a response even with errors
      expect(response).toBeDefined();
      expect(response.status).toBeDefined();
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const request = createMockRequest('http://localhost:7071/api/categories');
      const context = createMockContext();
      
      const response = await getCategories(request, context);
      
      expect(response.status).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/json');
      
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body).toContain('AI');
      expect(body).toContain('Azure');
      expect(body).toContain('Compute');
    });

    it('should return unique categories', async () => {
      const request = createMockRequest('http://localhost:7071/api/categories');
      const context = createMockContext();
      
      const response = await getCategories(request, context);
      const body = JSON.parse(response.body);
      
      const uniqueCategories = [...new Set(body)];
      expect(body.length).toBe(uniqueCategories.length);
    });
  });

  describe('getUpdatesByCategory', () => {
    it('should return updates for specific category', async () => {
      const request = createMockRequest('http://localhost:7071/api/updates/category/Compute');
      request.params = { category: 'Compute' };
      const context = createMockContext();
      
      const response = await getUpdatesByCategory(request, context);
      
      expect(response.status).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      body.forEach(update => {
        expect(update.categories).toContain('Compute');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const request = createMockRequest('http://localhost:7071/api/updates/category/NonExistent');
      request.params = { category: 'NonExistent' };
      const context = createMockContext();
      
      const response = await getUpdatesByCategory(request, context);
      
      expect(response.status).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(0);
    });

    it('should respect limit parameter', async () => {
      const request = createMockRequest('http://localhost:7071/api/updates/category/Azure?limit=2');
      request.params = { category: 'Azure' };
      const context = createMockContext();
      
      const response = await getUpdatesByCategory(request, context);
      
      expect(response.status).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.length).toBeLessThanOrEqual(2);
    });
  });

  describe('API Response Format', () => {
    it('should include CORS headers', async () => {
      const request = createMockRequest('http://localhost:7071/api/updates');
      const context = createMockContext();
      
      const response = await getUpdates(request, context);
      
      expect(response.headers).toHaveProperty('Access-Control-Allow-Origin');
      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('should return proper JSON content type', async () => {
      const request = createMockRequest('http://localhost:7071/api/updates');
      const context = createMockContext();
      
      const response = await getUpdates(request, context);
      
      expect(response.headers['Content-Type']).toBe('application/json');
    });

    it('should return valid JSON', async () => {
      const request = createMockRequest('http://localhost:7071/api/updates');
      const context = createMockContext();
      
      const response = await getUpdates(request, context);
      
      expect(() => JSON.parse(response.body)).not.toThrow();
    });
  });
});
