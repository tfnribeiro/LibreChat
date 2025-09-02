import type { Document, Types } from 'mongoose';

export interface IMongoKnowledgeBase extends Omit<Document, 'model'> {
  user: Types.ObjectId;
  name: string;
  description?: string;
  slug?: string;
  conversationIds: Types.ObjectId[];
  fileIds?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
