// api/models/KnowledgeBase.spec.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createModels } = require('@librechat/data-schemas');
const {
  createKnowledgeBase,
  deleteKnowledgeBase,
  updateKnowledgeBaseName,
  updateKnowledgeBaseDescription,
  addConversationToKnowledgeBase,
  removeConversationFromKnowledgeBase,
  addFileToKnowledgeBase,
  removeFileFromKnowledgeBase
} = require('./KnowledgeBase');

let File;
let User;
let KnowledgeBase;
let convId1;
let convId2;
let fileId1;
let fileId2;

describe('KnowledgeBase Operations', () => {
  let mongoServer;
  let kbData;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Initialize all models
    const models = createModels(mongoose);

    // Track which models we're adding
    modelsToCleanup = Object.keys(models);

    // Register models on mongoose.models so methods can access them
    const dbModels = require('~/db/models');
    Object.assign(mongoose.models, dbModels);

    File = dbModels.File;
    User = dbModels.User;
    KnowledgeBase = dbModels.KnowledgeBase; 
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database
    await KnowledgeBase.deleteMany({});
    await User.deleteMany({});

    // Create a real user to reference by ObjectId
    const testUser = await User.create({
      email: 'user@example.com',
      emailVerified: true,
      provider: 'local',
    });

    convId1 = new mongoose.Types.ObjectId().toString();
    convId2 = new mongoose.Types.ObjectId().toString();
    fileId1 = new mongoose.Types.ObjectId().toString();
    fileId2 = new mongoose.Types.ObjectId().toString();

    kbData = {
      user: testUser._id,
      name: 'Test Knowledge Base',
      description: 'A test knowledge base for testing purposes',
      slug: 'test-kb'
    };
  });

  describe('createKnowledgeBase', () => {
    it('should create a new knowledge base', async () => {
      const result = await createKnowledgeBase(kbData);
      
      expect(result).toBeTruthy();
      expect(result.user.toString()).toBe(kbData.user.toString());
      expect(result.name).toBe('Test Knowledge Base');
      expect(result.description).toBe('A test knowledge base for testing purposes');
      expect(result.slug).toBe('test-kb');
      expect(result.conversationIds).toHaveLength(0);
      expect(result.fileIds).toHaveLength(0);
    });

    it('should create a knowledge base with minimal data', async () => {
      const minimalData = {
        user: kbData.user,
        name: 'Minimal KB'
      };
      
      const result = await createKnowledgeBase(minimalData);
      
      expect(result).toBeTruthy();
      expect(result.user.toString()).toBe(kbData.user.toString());
      expect(result.name).toBe('Minimal KB');
      expect(result.description).toBeUndefined();
    });
  });

  describe('deleteKnowledgeBase', () => {
    it('should delete a knowledge base by ID', async () => {
      // First create a knowledge base
      const createdKb = await createKnowledgeBase(kbData);
      
      // Then delete it
      const result = await deleteKnowledgeBase(createdKb._id);
      
      expect(result).toBeTruthy();
      expect(result.name).toBe('Test Knowledge Base');
      
      // Verify it's deleted from database
      const deletedKb = await KnowledgeBase.findById(createdKb._id);
      expect(deletedKb).toBeNull();
    });

    it('should return null when deleting non-existent knowledge base', async () => {
      const result = await deleteKnowledgeBase(new mongoose.Types.ObjectId().toString());
      expect(result).toBeNull();
    });
  });

  describe('updateKnowledgeBaseName', () => {
    it('should update a knowledge base name', async () => {
      // First create a knowledge base
      const createdKb = await createKnowledgeBase(kbData);
      
      // Then update the name
      const result = await updateKnowledgeBaseName(createdKb._id, 'Updated Test KB');
      
      expect(result).toBeTruthy();
      expect(result.name).toBe('Updated Test KB');
      expect(result.description).toBe('A test knowledge base for testing purposes');
    });

    it('should throw an error when updating non-existent knowledge base', async () => {
      await expect(updateKnowledgeBaseName('non-existent-id', 'New Name'))
        .rejects.toThrow();
    });
  });

  describe('updateKnowledgeBaseDescription', () => {
    it('should update a knowledge base description', async () => {
      // First create a knowledge base
      const createdKb = await createKnowledgeBase(kbData);
      
      // Then update the description
      const result = await updateKnowledgeBaseDescription(createdKb._id, 'Updated description');
      
      expect(result).toBeTruthy();
      expect(result.description).toBe('Updated description');
      expect(result.name).toBe('Test Knowledge Base');
    });

    it('should set description to null when updating with empty string', async () => {
      // First create a knowledge base
      const createdKb = await createKnowledgeBase(kbData);
      
      // Then update the description to empty string
      const result = await updateKnowledgeBaseDescription(createdKb._id, '');
      
      expect(result).toBeTruthy();
      expect(result.description).toBe('');
    });
  });

  describe('addConversationToKnowledgeBase', () => {
    it('should add a conversation to a knowledge base', async () => {
      // First create a knowledge base
      const createdKb = await createKnowledgeBase(kbData);
      
      // Then add a conversation
      const result = await addConversationToKnowledgeBase(createdKb._id, convId1);
      
      expect(result).toBeTruthy();
      expect(result.conversationIds).toHaveLength(1);
      expect(result.conversationIds[0].toString()).toBe(convId1);
    });

    it('should not add duplicate conversations', async () => {
      // First create a knowledge base
      const createdKb = await createKnowledgeBase(kbData);
      
      // Add the same conversation twice
      await addConversationToKnowledgeBase(createdKb._id, convId1);
      const result = await addConversationToKnowledgeBase(createdKb._id, convId1);
      
      expect(result).toBeTruthy();
      expect(result.conversationIds).toHaveLength(1);
    });

    it('should throw an error when adding to non-existent knowledge base', async () => {
      await expect(addConversationToKnowledgeBase('non-existent-id', convId1))
        .rejects.toThrow();
    });
  });

  describe('removeConversationFromKnowledgeBase', () => {
    it('should remove a conversation from a knowledge base', async () => {
      // First create a knowledge base with a conversation
      const createdKb = await createKnowledgeBase(kbData);
      await addConversationToKnowledgeBase(createdKb._id, convId1);
      
      // Then remove the conversation
      const result = await removeConversationFromKnowledgeBase(createdKb._id, convId1);
      
      expect(result).toBeTruthy();
      expect(result.conversationIds).toHaveLength(0);
    });

    it('should not fail when removing non-existent conversation', async () => {
      // First create a knowledge base
      const createdKb = await createKnowledgeBase(kbData);
      
      // Then try to remove a non-existent conversation
      const result = await removeConversationFromKnowledgeBase(createdKb._id, convId1);
      
      expect(result).toBeTruthy();
      expect(result.conversationIds).toHaveLength(0);
    });

    it('should throw an error when removing from non-existent knowledge base', async () => {
      await expect(removeConversationFromKnowledgeBase('non-existent-id', convId1))
        .rejects.toThrow();
    });
  });

  describe('addFileToKnowledgeBase', () => {
    it('should add a file to a knowledge base', async () => {
      // First create a knowledge base
      const createdKb = await createKnowledgeBase(kbData);
      
      // Then add a file
      const result = await addFileToKnowledgeBase(createdKb._id, fileId1);
      
      expect(result).toBeTruthy();
      expect(result.fileIds).toHaveLength(1);
      expect(result.fileIds[0].toString()).toBe(fileId1);
    });

    it('should not add duplicate files', async () => {
      // First create a knowledge base
      const createdKb = await createKnowledgeBase(kbData);
      
      // Add the same file twice
      await addFileToKnowledgeBase(createdKb._id, fileId1);
      const result = await addFileToKnowledgeBase(createdKb._id, fileId1);
      
      expect(result).toBeTruthy();
      expect(result.fileIds).toHaveLength(1);
    });

    it('should throw an error when adding to non-existent knowledge base', async () => {
      await expect(addFileToKnowledgeBase('non-existent-id', fileId1))
        .rejects.toThrow();
    });
  });

  describe('removeFileFromKnowledgeBase', () => {
    it('should remove a file from a knowledge base', async () => {
      // First create a knowledge base with a file
      const createdKb = await createKnowledgeBase(kbData);
      await addFileToKnowledgeBase(createdKb._id, fileId1);
      
      // Then remove the file
      const result = await removeFileFromKnowledgeBase(createdKb._id, fileId1);
      
      expect(result).toBeTruthy();
      expect(result.fileIds).toHaveLength(0);
    });

    it('should not fail when removing non-existent file', async () => {
      // First create a knowledge base
      const createdKb = await createKnowledgeBase(kbData);
      
      // Then try to remove a non-existent file
      const result = await removeFileFromKnowledgeBase(createdKb._id, fileId1);
      
      expect(result).toBeTruthy();
      expect(result.fileIds).toHaveLength(0);
    });

    it('should throw an error when removing from non-existent knowledge base', async () => {
      await expect(removeFileFromKnowledgeBase('non-existent-id', fileId1))
        .rejects.toThrow();
    });
  });

  describe('Combined Operations', () => {
    it('should handle multiple operations on the same knowledge base', async () => {
      // Create a knowledge base
      const createdKb = await createKnowledgeBase(kbData);
      
      // Add conversations and files
      await addConversationToKnowledgeBase(createdKb._id, convId1);
      await addConversationToKnowledgeBase(createdKb._id, convId2);
      await addFileToKnowledgeBase(createdKb._id, fileId1);
      await addFileToKnowledgeBase(createdKb._id, fileId2);
      
      // Update name and description
      const updatedName = await updateKnowledgeBaseName(createdKb._id, 'Updated Name');
      const updatedDesc = await updateKnowledgeBaseDescription(createdKb._id, 'Updated Description');
      
      // Verify all operations worked correctly
      expect(updatedName.name).toBe('Updated Name');
      expect(updatedDesc.description).toBe('Updated Description');
      expect(updatedName.conversationIds).toHaveLength(2);
      expect(updatedName.fileIds).toHaveLength(2);
      
      // Remove some items
      await removeConversationFromKnowledgeBase(createdKb._id, convId1);
      await removeFileFromKnowledgeBase(createdKb._id, fileId1);
      
      const finalKb = await KnowledgeBase.findById(createdKb._id);
      expect(finalKb.conversationIds).toHaveLength(1);
      expect(finalKb.fileIds).toHaveLength(1);
    });
  });
});
