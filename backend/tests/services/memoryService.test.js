import { jest } from '@jest/globals';
import mongoose from 'mongoose';

// Mock the dependencies
jest.unstable_mockModule('../../src/services/embeddingService.js', () => ({
  generateEmbedding: jest.fn()
}));

jest.unstable_mockModule('../../src/services/MemoryExtractor.js', () => ({
  extractMemories: jest.fn()
}));

// Dynamic imports after mocking
const { generateEmbedding } = await import('../../src/services/embeddingService.js');
const { extractMemories } = await import('../../src/services/MemoryExtractor.js');
const { processInactiveSessions, saveMemory, searchMemories } = await import('../../src/services/memoryService.js');
const { default: GlobalChatSession } = await import('../../src/models/globalChatSession.model.js');
const { default: Memory } = await import('../../src/models/Memory.js');

describe('MemoryService', () => {
  let userId;

  beforeEach(() => {
    jest.clearAllMocks();
    userId = new mongoose.Types.ObjectId();
    
    // Mock Atlas-specific $vectorSearch so it doesn't crash mongodb-memory-server
    jest.spyOn(Memory, 'aggregate').mockResolvedValue([]);
  });

  describe('saveMemory', () => {
    it('should save a new memory when no duplicate exists', async () => {
      generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      Memory.aggregate.mockResolvedValue([]); // No duplicates

      const result = await saveMemory(userId, { category: 'SKILL', content: 'Testing' });

      expect(generateEmbedding).toHaveBeenCalledWith('Testing');
      expect(result.content).toBe('Testing');
      expect(result.category).toBe('SKILL');

      const count = await Memory.countDocuments({ user: userId });
      expect(count).toBe(1);
    });

    it('should update lastAccessedAt if it is a duplicate (>0.95 threshold)', async () => {
      generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      
      const existingId = new mongoose.Types.ObjectId();
      await Memory.create({
        _id: existingId,
        user: userId,
        content: 'Original',
        category: 'SKILL',
        embedding: [0.1, 0.2, 0.3],
        lastAccessedAt: new Date(2020, 1, 1)
      });

      // Mock Vector Search to return the existing document with score > 0.95
      Memory.aggregate.mockResolvedValue([{
        _id: existingId,
        score: 0.96,
        category: 'SKILL'
      }]);

      const result = await saveMemory(userId, { category: 'SKILL', content: 'Original' });

      expect(result._id.toString()).toBe(existingId.toString());

      const updated = await Memory.findById(existingId);
      expect(updated.lastAccessedAt.getTime()).toBeGreaterThan(new Date(2020, 1, 1).getTime());
      
      const count = await Memory.countDocuments({ user: userId });
      expect(count).toBe(1); // Didn't create a new one
    });
  });

  describe('processInactiveSessions (Cron Job)', () => {
    it('should process PENDING sessions older than 15 minutes and mark as EXTRACTED', async () => {
      // Create an old session
      const session = await GlobalChatSession.create({
        user: userId,
        messages: [{ role: 'user', content: 'test' }],
        memoryStatus: 'PENDING'
      });

      // Manually backdate updatedAt to bypass the 15-minute wait
      await GlobalChatSession.collection.updateOne(
        { _id: session._id },
        { $set: { updatedAt: new Date(Date.now() - 20 * 60 * 1000) } }
      );

      // Mock extraction
      extractMemories.mockResolvedValue({
        summary: 'Test summary',
        memories: [{ category: 'OTHER', content: 'Test memory' }]
      });

      generateEmbedding.mockResolvedValue([0.1, 0.1]);

      await processInactiveSessions();

      const updatedSession = await GlobalChatSession.findById(session._id);
      expect(updatedSession.memoryStatus).toBe('EXTRACTED');
      expect(updatedSession.summary).toBe('Test summary');
      expect(extractMemories).toHaveBeenCalled();
    });

    it('should process FAILED sessions if retryCount < 3', async () => {
      const session = await GlobalChatSession.create({
        user: userId,
        messages: [{ role: 'user', content: 'test' }],
        memoryStatus: 'FAILED',
        memoryRetryCount: 1
      });

      await GlobalChatSession.collection.updateOne(
        { _id: session._id },
        { $set: { updatedAt: new Date(Date.now() - 20 * 60 * 1000) } }
      );

      extractMemories.mockResolvedValue({ summary: '', memories: [] });

      await processInactiveSessions();

      const updatedSession = await GlobalChatSession.findById(session._id);
      expect(updatedSession.memoryStatus).toBe('EXTRACTED');
    });

    it('should ignore FAILED sessions if retryCount is 3', async () => {
      const session = await GlobalChatSession.create({
        user: userId,
        messages: [{ role: 'user', content: 'test' }],
        memoryStatus: 'FAILED',
        memoryRetryCount: 3
      });

      await GlobalChatSession.collection.updateOne(
        { _id: session._id },
        { $set: { updatedAt: new Date(Date.now() - 20 * 60 * 1000) } }
      );

      await processInactiveSessions();

      const updatedSession = await GlobalChatSession.findById(session._id);
      expect(updatedSession.memoryStatus).toBe('FAILED'); // Still FAILED
      expect(extractMemories).not.toHaveBeenCalled();
    });

    it('should increment retryCount when extraction throws an error', async () => {
      const session = await GlobalChatSession.create({
        user: userId,
        messages: [{ role: 'user', content: 'test' }],
        memoryStatus: 'PENDING'
      });

      await GlobalChatSession.collection.updateOne(
        { _id: session._id },
        { $set: { updatedAt: new Date(Date.now() - 20 * 60 * 1000) } }
      );

      extractMemories.mockRejectedValue(new Error('API Down'));

      await processInactiveSessions();

      const updatedSession = await GlobalChatSession.findById(session._id);
      expect(updatedSession.memoryStatus).toBe('FAILED');
      expect(updatedSession.memoryRetryCount).toBe(1);
    });
  });
});
