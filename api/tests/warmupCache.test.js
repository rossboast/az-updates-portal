import { describe, it, expect, vi, beforeEach } from 'vitest';
import { warmupCache } from '../src/handlers/warmupCache.js';

describe('Warmup Cache Handler', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      log: vi.fn(),
      error: vi.fn()
    };
  });

  it('should execute warmup without errors', async () => {
    await warmupCache(mockContext);
    
    expect(mockContext.log).toHaveBeenCalledWith('Warming up cache on function startup...');
    expect(mockContext.log).toHaveBeenCalled();
  });

  it('should log appropriate messages during warmup', async () => {
    await warmupCache(mockContext);
    
    const logCalls = mockContext.log.mock.calls.map(call => call[0]);
    expect(logCalls).toContain('Warming up cache on function startup...');
  });

  it('should not throw errors even if warmup fails', async () => {
    await expect(warmupCache(mockContext)).resolves.not.toThrow();
  });
});
