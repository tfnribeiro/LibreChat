import mongoose, { Schema } from 'mongoose';
import type { IMongoKnowledgeBase } from '~/types';

// KnowledgeBase stores associations between conversations and files per user
const knowledgeBase: Schema<IMongoKnowledgeBase> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
      validate: {
        validator: async function (id: mongoose.Types.ObjectId) {
          if (!id) return false;
          try {
            const exists = await mongoose.model('User').exists({ _id: id });
            return !!exists;
          } catch {
            return false;
          }
        },
        message: 'Referenced user does not exist',
      },
    },
    name: { type: String, required: true },
    description: { type: String },
    slug: { type: String, index: true },
    conversationIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Conversation',
      default: [],
      // Normalize null/undefined to empty array so field is always iterable
      set: (v: mongoose.Types.ObjectId[] | null | undefined) => (v == null ? [] : v),
      validate: {
        validator: async function (ids: mongoose.Types.ObjectId[]) {
          if (!Array.isArray(ids) || ids.length === 0) return true;
          const count = await mongoose.model('Conversation').countDocuments({ _id: { $in: ids } });
          return count === ids.length;
        },
        message: 'One or more referenced conversations do not exist',
      },
    },
    fileIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'File',
      default: [],
      // Normalize null/undefined to empty array
      set: (v: mongoose.Types.ObjectId[] | null | undefined) => (v == null ? [] : v),
      validate: {
        validator: async function (ids: mongoose.Types.ObjectId[]) {
          if (!Array.isArray(ids) || ids.length === 0) return true;
          const count = await mongoose.model('File').countDocuments({ _id: { $in: ids } });
          return count === ids.length;
        },
        message: 'One or more referenced files do not exist',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

knowledgeBase.index({ user: 1, name: 1 }, { unique: true });
knowledgeBase.virtual('conversations', {
  ref: 'Conversation',
  localField: 'conversationIds',
  foreignField: '_id',
  justOne: false,
});

export default knowledgeBase;
