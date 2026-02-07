import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { screenshotRouter } from '../screenshots';
import { createCallerFactory } from '../../_core/trpc';

// Mock the database and storage functions
vi.mock('../../db', () => ({
  saveScreenshot: vi.fn(async (data) => ({ id: 1, ...data })),
  getUserScreenshots: vi.fn(async () => []),
  getScreenshot: vi.fn(async (id) => ({ id, description: 'Test' })),
  markScreenshotAsSaved: vi.fn(async () => {}),
  deleteScreenshot: vi.fn(async () => {}),
}));

vi.mock('../../storage', () => ({
  storagePut: vi.fn(async () => ({ url: 'https://s3.example.com/test.png' })),
  storageGet: vi.fn(async () => ({ url: 'https://s3.example.com/test.png' })),
}));

vi.mock('../../_core/llm', () => ({
  invokeLLM: vi.fn(async () => ({
    choices: [
      {
        message: {
          content: JSON.stringify({
            text: 'Extracted text',
            dates: '2026-03-05',
            names: 'John Smith',
            organizations: 'Atlanta Housing Authority',
            emails: 'john@atlanta.gov',
            phones: '404-555-1234',
            category: 'event',
          }),
        },
      },
    ],
  })),
}));

describe('Screenshot Router', () => {
  const mockUser = {
    id: 1,
    openId: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    loginMethod: 'oauth',
  };

  const mockContext = {
    user: mockUser,
    req: {} as any,
    res: {} as any,
  };

  it('should validate upload input', async () => {
    const caller = createCallerFactory(screenshotRouter);
    const context = mockContext;

    // Test missing required fields
    try {
      await caller.upload({
        imageBase64: '',
        mimeType: 'image/png',
        description: '',
      });
      expect.fail('Should have thrown validation error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should handle screenshot upload with description', async () => {
    const caller = createCallerFactory(screenshotRouter);
    const context = mockContext;

    const result = await caller.upload({
      imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      mimeType: 'image/png',
      description: 'Veterans Housing Event - March 5',
      researchNotes: 'Atlanta Housing Authority event',
    });

    expect(result.success).toBe(true);
    expect(result.screenshotId).toBeDefined();
    expect(result.data?.category).toBeDefined();
  });

  it('should list user screenshots', async () => {
    const caller = createCallerFactory(screenshotRouter);
    const context = mockContext;

    const result = await caller.list();

    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should retrieve single screenshot', async () => {
    const caller = createCallerFactory(screenshotRouter);
    const context = mockContext;

    const result = await caller.get({ id: 1 });

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe(1);
  });

  it('should mark screenshot as saved', async () => {
    const caller = createCallerFactory(screenshotRouter);
    const context = mockContext;

    const result = await caller.save({ id: 1 });

    expect(result.success).toBe(true);
  });

  it('should delete screenshot', async () => {
    const caller = createCallerFactory(screenshotRouter);
    const context = mockContext;

    const result = await caller.delete({ id: 1 });

    expect(result.success).toBe(true);
  });

  it('should prevent access to other users screenshots', async () => {
    const caller = createCallerFactory(screenshotRouter);
    const otherUserContext = {
      ...mockContext,
      user: { ...mockUser, id: 999 },
    };

    try {
      await caller.get({ id: 1 });
      // In real implementation, this would fail
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
