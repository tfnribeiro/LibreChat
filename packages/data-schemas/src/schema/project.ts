import { Schema } from 'mongoose';
import type { IMongoProject } from '~/types';

const projectSchema = new Schema<IMongoProject>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    promptGroupIds: {
      type: [Schema.Types.ObjectId],
      ref: 'PromptGroup',
      default: [],
    },
    agentIds: {
      type: [String],
      ref: 'Agent',
      default: [],
    },
    conversationIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Conversation',
      default: [],
    },
    fileIds: {
      type: [Schema.Types.ObjectId],
      ref: 'File',
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default projectSchema;
