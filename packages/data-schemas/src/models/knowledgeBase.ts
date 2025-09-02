import knowledgeBaseSchema from '~/schema/knowledgeBase';
import type { IMongoKnowledgeBase } from '~/types';

/**
 * Creates or returns the KnowledgeBase model using the provided mongoose instance and schema
 */
export function createKnowledgeBaseModel(mongoose: typeof import('mongoose')) {
  return mongoose.models.KnowledgeBase || mongoose.model<IMongoKnowledgeBase>('KnowledgeBase', knowledgeBaseSchema);
}