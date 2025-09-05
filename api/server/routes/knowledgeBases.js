const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { requireJwtAuth } = require('~/server/middleware');
const { getConvosByCursor } = require('~/models/Conversation');
const { KnowledgeBase } = require('~/db/models');
const {
  createKnowledgeBase,
  deleteKnowledgeBase,
  updateKnowledgeBaseName,
  updateKnowledgeBaseDescription,
  addConversationToKnowledgeBase,
  removeConversationFromKnowledgeBase,
} = require('~/models/KnowledgeBase');

router.use(requireJwtAuth);

async function getKB(req, idOrSlug) {
  const kbQuery = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug, user: req.user.id }
    : { slug: idOrSlug, user: req.user.id };

  const kb = await KnowledgeBase.findOne(kbQuery).lean();
  return kb;
}

// Get conversations for a specific knowledge base with cursor pagination
router.get('/:idOrSlug/conversations', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { cursor, limit } = req.query;

    const kb = await getKB(req, idOrSlug);
    if (!kb) {
      return res.status(404).json({ message: 'Knowledge base not found' });
    }

    const limitNum = typeof limit !== 'undefined' ? parseInt(limit, 10) : undefined;

    const result = await getConvosByCursor(req.user.id, {
      cursor: cursor || undefined,
      limit: Number.isFinite(limitNum) ? limitNum : undefined,
      additionalFilters: {
        _id: { $in: Array.isArray(kb.conversationIds) ? kb.conversationIds : [] },
      },
    });

    // Ensure consistent response shape
    return res.status(200).json({
      conversations: result.conversations || [],
      nextCursor: result.nextCursor ?? null,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to retrieve knowledge base conversations', error: error.message });
  }
});

// List knowledge bases for current user
router.get('/', async (req, res) => {
  try {
    const limit = 5;
    const kbs = await KnowledgeBase.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'conversations',
        select: 'title conversationId _id',
        options: { limit: limit, sort: { createdAt: -1 } },
      });

    res.status(200).json(kbs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve knowledge bases', error: error.message });
  }
});

// Create a knowledge base for current user
router.post('/', async (req, res) => {
  try {
    const { name, description, slug } = req.body || {};
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Unauthorized' });

    if (!name || typeof name !== 'string' || name.trim() === '')
      return res.status(400).json({ message: 'Name is required' });

    const kb = await createKnowledgeBase({
      user: req.user.id,
      name: name.trim(),
      description: description ?? undefined,
      slug: slug ?? undefined,
    });
    res.status(201).json(kb);
  } catch (error) {
    if (error.code === 11000) res.status(409).json({ message: 'Name Already exists' });
    res.status(500).json({ message: 'Failed to create knowledge base', error: error.message });
  }
});

// Update name or description
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body || {};
    let kb = null;
    if (typeof name !== 'undefined') {
      kb = await updateKnowledgeBaseName(id, name);
    }
    if (typeof description !== 'undefined') {
      kb = await updateKnowledgeBaseDescription(id, description);
    }
    res.status(200).json(kb);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update knowledge base', error: error.message });
  }
});

// Delete knowledge base
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const kb = await deleteKnowledgeBase(id);
    res.status(200).json(kb);
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete knowledge base', error: error.message });
  }
});

router.post('/:idOrSlug/addConversation', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { conversationId } = req.body || {};
    const kb = await getKB(req, idOrSlug);
    if (!kb) {
      return res.status(404).json({ message: 'Knowledge base not found' });
    }
    const updated = await addConversationToKnowledgeBase(kb._id, conversationId);
    res.status(201).json(updated);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to add conversation to KB.', error: error.message });
  }
});

router.post('/:idOrSlug/removeConversation', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { conversationId } = req.body || {};
    const kb = await getKB(req, idOrSlug);
    if (!kb) {
      return res.status(404).json({ message: 'Knowledge base not found' });
    }
    const updated = await removeConversationFromKnowledgeBase(kb._id, conversationId);
    res.status(200).json(updated);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to remove conversation to KB.', error: error.message });
  }
});

module.exports = router;
