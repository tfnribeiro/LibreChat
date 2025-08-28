import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import projectSchema from './project';
import type { IMongoProject } from '~/types';

let mongoServer: MongoMemoryServer;
let Project: mongoose.Model<IMongoProject>;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  Project = mongoose.models.Project || mongoose.model<IMongoProject>('Project', projectSchema);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Project Schema', () => {
  it('stores conversation and file ids', async () => {
    const convoId = new mongoose.Types.ObjectId();
    const fileId = new mongoose.Types.ObjectId();
    const project = await Project.create({
      name: 'Test',
      conversationIds: [convoId],
      fileIds: [fileId],
    });
    const found = await Project.findById(project._id).lean();
    expect(found?.conversationIds?.[0].toString()).toBe(convoId.toString());
    expect(found?.fileIds?.[0].toString()).toBe(fileId.toString());
  });
});
