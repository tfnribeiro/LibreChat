import { atom } from 'recoil';

export type KnowledgeBase = {
  id: string; // display/id in URL (slug or name)
  name: string; // human readable name
  conversations: { id: string; title: string }[];
};

export const knowledgeBasesState = atom<KnowledgeBase[]>({
  key: 'knowledgeBasesState',
  default: [],
});

