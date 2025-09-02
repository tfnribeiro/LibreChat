// api/models/KnowledgeBase.js
const { logger } = require('@librechat/data-schemas');
const mongoose = require('mongoose');
const { KnowledgeBase } = require('~/db/models');

/**
 * Creates a new knowledge base
 * @param {Object} data - The knowledge base data
 * @returns {Promise<Object>} Created knowledge base
 */
const createKnowledgeBase = async (data) => {
  try {
    const kb = new KnowledgeBase(data);
    return await kb.save();
  } catch (error) {
    logger.error('Error creating knowledge base:', error);
    throw error;
  }
};

/**
 * Deletes a knowledge base by ID
 * @param {string} id - The knowledge base ID
 * @returns {Promise<Object>} Deleted knowledge base
 */
const deleteKnowledgeBase = async (id) => {
  try {
    return await KnowledgeBase.findByIdAndDelete(id);
  } catch (error) {
    logger.error('Error deleting knowledge base:', error);
    throw error;
  }
};

/**
 * Updates a knowledge base's name
 * @param {string} id - The knowledge base ID
 * @param {string} name - The new name
 * @returns {Promise<Object>} Updated knowledge base
 */
const updateKnowledgeBaseName = async (id, name) => {
  try {
    return await KnowledgeBase.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
  } catch (error) {
    logger.error('Error updating knowledge base name:', error);
    throw error;
  }
};

/**
 * Updates a knowledge base's description
 * @param {string} id - The knowledge base ID
 * @param {string} description - The new description
 * @returns {Promise<Object>} Updated knowledge base
 */
const updateKnowledgeBaseDescription = async (id, description) => {
  try {
    return await KnowledgeBase.findByIdAndUpdate(
      id,
      { description },
      { new: true }
    );
  } catch (error) {
    logger.error('Error updating knowledge base description:', error);
    throw error;
  }
};

/**
 * Adds a conversation to a knowledge base
 * @param {string} kbId - The knowledge base ID
 * @param {string} conversationId - The conversation ID to add
 * @returns {Promise<Object>} Updated knowledge base
 */
const addConversationToKnowledgeBase = async (kbId, conversationId) => {
  try {
    const convObjectId = mongoose.isValidObjectId(conversationId)
      ? new mongoose.Types.ObjectId(conversationId)
      : conversationId;
    return await KnowledgeBase.findByIdAndUpdate(
      kbId,
      { $addToSet: { conversationIds: convObjectId } },
      { new: true }
    );
  } catch (error) {
    logger.error('Error adding conversation to knowledge base:', error);
    throw error;
  }
};

/**
 * Removes a conversation from a knowledge base
 * @param {string} kbId - The knowledge base ID
 * @param {string} conversationId - The conversation ID to remove
 * @returns {Promise<Object>} Updated knowledge base
 */
const removeConversationFromKnowledgeBase = async (kbId, conversationId) => {
  try {
    const convObjectId = mongoose.isValidObjectId(conversationId)
      ? new mongoose.Types.ObjectId(conversationId)
      : conversationId;
    return await KnowledgeBase.findByIdAndUpdate(
      kbId,
      { $pull: { conversationIds: convObjectId } },
      { new: true }
    );
  } catch (error) {
    logger.error('Error removing conversation from knowledge base:', error);
    throw error;
  }
};

/**
 * Adds a file to a knowledge base
 * @param {string} kbId - The knowledge base ID
 * @param {string} fileId - The file ID to add
 * @returns {Promise<Object>} Updated knowledge base
 */
const addFileToKnowledgeBase = async (kbId, fileId) => {
  try {
    const fileObjectId = mongoose.isValidObjectId(fileId)
      ? new mongoose.Types.ObjectId(fileId)
      : fileId;
    return await KnowledgeBase.findByIdAndUpdate(
      kbId,
      { $addToSet: { fileIds: fileObjectId } },
      { new: true }
    );
  } catch (error) {
    logger.error('Error adding file to knowledge base:', error);
    throw error;
  }
};

/**
 * Removes a file from a knowledge base
 * @param {string} kbId - The knowledge base ID
 * @param {string} fileId - The file ID to remove
 * @returns {Promise<Object>} Updated knowledge base
 */
const removeFileFromKnowledgeBase = async (kbId, fileId) => {
  try {
    const fileObjectId = mongoose.isValidObjectId(fileId)
      ? new mongoose.Types.ObjectId(fileId)
      : fileId;
    return await KnowledgeBase.findByIdAndUpdate(
      kbId,
      { $pull: { fileIds: fileObjectId } },
      { new: true }
    );
  } catch (error) {
    logger.error('Error removing file from knowledge base:', error);
    throw error;
  }
};

module.exports = {
  createKnowledgeBase,
  deleteKnowledgeBase,
  updateKnowledgeBaseName,
  updateKnowledgeBaseDescription,
  addConversationToKnowledgeBase,
  removeConversationFromKnowledgeBase,
  addFileToKnowledgeBase,
  removeFileFromKnowledgeBase
};
