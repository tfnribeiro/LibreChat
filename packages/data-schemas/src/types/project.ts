import type { Document, Types } from 'mongoose';

export interface IMongoProject extends Document {
  name: string;
  promptGroupIds: Types.ObjectId[];
  agentIds: string[];
  conversationIds: Types.ObjectId[];
  fileIds: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type Project = IMongoProject;
